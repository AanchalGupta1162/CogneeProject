import asyncio
from celery import shared_task
from packages.agents.ingestor import IngestorAgent
from packages.agents.assigner import AssignerAgent
from packages.shared.database import SessionLocal
from packages.domain.models import Ticket, AssignmentRecommendation, Developer
from packages.infrastructure.github_client import github_client
from packages.agents.tools import add_to_memory

# In a real environment, we'd wrap async calls properly for Celery.
# For simplicity, we use asyncio.run in tasks.

@shared_task
def trigger_ingestion_agent(repo_id: str, event: str, payload: dict):
    agent = IngestorAgent()
    asyncio.run(agent.run(repo_id, payload))
    return f"Ingestion triggered for {repo_id}"

@shared_task
def trigger_historical_sync(repo_id: str, limit: int = 10):
    """Fetches the last N commits from GitHub and adds them to memory."""
    commits = github_client.get_repo_commits(repo_id, limit)
    
    async def process_commits():
        for commit in commits:
            # We don't fetch full file patches here to save time/tokens during bulk sync,
            # but we ingest the commit metadata.
            import json
            await add_to_memory(repo_id, f"Commit data: {json.dumps(commit)}")
        
        # After adding all data points, we trigger cognify for the repo dataset
        from packages.infrastructure.cognee_client import memory_service
        await memory_service.cognify_repository(repo_id)

    asyncio.run(process_commits())
    return f"Historical sync completed for {repo_id} with {len(commits)} commits."


@shared_task
def trigger_assignment_agent(ticket_id: str):
    db = SessionLocal()
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket or not ticket.repository_id:
        db.close()
        return "No ticket or repository found."

    agent = AssignerAgent()
    result = asyncio.run(agent.run(
        ticket_id=ticket.id, 
        repo_id=ticket.repository_id, 
        title=ticket.title, 
        description=ticket.description
    ))
    
    dev = None
    if result.get("recommended_developer_email"):
        dev = db.query(Developer).filter(Developer.canonical_email == result["recommended_developer_email"]).first()
    
    recommendation = AssignmentRecommendation(
        ticket_id=ticket.id,
        recommended_developer_id=dev.id if dev else None,
        confidence_score=result.get("confidence_score", 0),
        reasoning=result.get("reasoning", "No reason provided."),
        evidence=result.get("evidence", {})
    )
    
    # Simple Triage Logic: If confidence < 70, leave unassigned, otherwise auto-assign
    if recommendation.confidence_score >= 70 and dev:
        ticket.assigned_developer_id = dev.id
        ticket.status = "assigned"
    else:
        ticket.status = "triage"
        
    db.add(recommendation)
    db.commit()
    db.close()
    
    return f"Assignment completed for ticket {ticket_id}."
