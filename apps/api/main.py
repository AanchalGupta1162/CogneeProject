from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from packages.shared.database import Base, engine
from packages.shared.config import settings
from apps.api.routes import auth, tickets, webhooks, repositories

# Create tables for demo purposes (use alembic for production)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

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
