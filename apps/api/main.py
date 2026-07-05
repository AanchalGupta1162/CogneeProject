import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# CRITICAL: We must align the API's graph storage path with the UI's storage path!
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
cognee_data_dir = os.path.join(repo_root, ".cognee_data")
os.environ["DATA_ROOT_DIRECTORY"] = os.path.join(cognee_data_dir, "data")
os.environ["SYSTEM_ROOT_DIRECTORY"] = os.path.join(cognee_data_dir, "system")
os.environ["CACHE_ROOT_DIRECTORY"] = os.path.join(cognee_data_dir, "cache")

from packages.shared.database import Base, engine, SessionLocal
from packages.shared.config import settings
from packages.infrastructure.redis_client import celery_app
from apps.api.routes import auth, tickets, webhooks, repositories
from packages.domain.models import Ticket, AssignmentRecommendation
from packages.agents.orchestrator import trigger_assignment_agent

# Create tables for demo purposes (use alembic for production)
Base.metadata.create_all(bind=engine)

async def process_tickets_rate_limited():
    while True:
        try:
            db = SessionLocal()
            # Find tickets that are in 'open' and have NO recommendations yet
            ticket = db.query(Ticket).outerjoin(AssignmentRecommendation).filter(
                Ticket.status == "open",
                AssignmentRecommendation.id == None
            ).order_by(Ticket.created_at.desc()).first()
            
            db.close()
            
            if ticket:
                print(f"Assigning ticket {ticket.id}...")
                # Run the assignment agent directly, but in a threadpool because trigger_assignment_agent uses asyncio.run()
                from starlette.concurrency import run_in_threadpool
                await run_in_threadpool(trigger_assignment_agent, ticket.id)
                print(f"Ticket {ticket.id} assignment complete. Waiting 30 seconds to avoid LLM rate limits...")
                await asyncio.sleep(30)
            else:
                # No tickets to process, wait a bit before checking again
                await asyncio.sleep(10)
        except Exception as e:
            print(f"Error in rate-limited ticket assignment: {e}")
            await asyncio.sleep(10)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the Cognee client
    from packages.infrastructure.cognee_client import memory_service
    await memory_service.setup()
    
    # Start the rate-limited assignment loop
    task = asyncio.create_task(process_tickets_rate_limited())
    yield
    # Clean up
    task.cancel()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # configure in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tickets.router)
app.include_router(webhooks.router)
app.include_router(repositories.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
