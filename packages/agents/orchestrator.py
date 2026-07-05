import asyncio
from celery import shared_task
from packages.agents.ingestor import IngestorAgent
from packages.agents.assigner import AssignerAgent
from packages.shared.database import SessionLocal
from packages.domain.models import Ticket, AssignmentRecommendation, Developer, Repository
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
    """Fetches the last N commits from GitHub and adds them to memory as formatted markdown."""
    print(f"[SYNC] Starting historical sync for {repo_id} (limit: {limit} commits)")
    commits = github_client.get_repo_commits(repo_id, limit)
    print(f"[SYNC] Found {len(commits)} commits to process.")
    
    async def process_commits():
        from packages.infrastructure.cognee_client import memory_service
        for i, commit in enumerate(commits):
            print(f"[SYNC] Extracting commit {i+1}/{len(commits)}: {commit['sha'][:7]}")
            
            # Format the commit and its patches into a Markdown document
            md = f"# Commit: {commit['message']}\n\n"
            md += f"**Repository**: {repo_id}\n"
            md += f"**Author**: {commit['author_name']} ({commit['author_email']})\n"
            md += f"**Date**: {commit['date']}\n"
            md += f"**SHA**: {commit['sha']}\n\n"
            
            try:
                files = github_client.get_commit_files(repo_id, commit['sha'])
                if files:
                    md += "## Modified Files\n\n"
                    for f in files:
                        md += f"### {f['filename']} ({f['status']})\n"
                        md += f"Changes: +{f.get('additions', 0)} / -{f.get('deletions', 0)}\n\n"
                        if f.get('patch'):
                            md += "```diff\n"
                            md += f['patch']
                            md += "\n```\n\n"
            except Exception as e:
                print(f"[SYNC] Error fetching files for commit {commit['sha']}: {e}")

            # Add this rich markdown document to Cognee
            await memory_service.add_repository_data(repo_id, md)
        
        print(f"[SYNC] All {len(commits)} commits added to memory buffer. Cognifying dataset now...")
        # Trigger cognify for the repo dataset
        await memory_service.cognify_repository(repo_id)
        print(f"[SYNC] Cognify complete for {repo_id}! Graph is ready.")

    asyncio.run(process_commits())
    return f"Historical sync completed for {repo_id} with {len(commits)} commits."


@shared_task
def trigger_assignment_agent(ticket_id: str):
    db = SessionLocal()
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket or not ticket.repository_id:
        db.close()
        return "No ticket or repository found."

    repo = db.query(Repository).filter(Repository.id == ticket.repository_id).first()
    repo_name = repo.name if repo else str(ticket.repository_id)

    agent = AssignerAgent()
    result = asyncio.run(agent.run(
        ticket_id=ticket.id, 
        repo_id=repo_name, 
        title=ticket.title, 
        description=ticket.description
    ))
    
    dev = None
    recommended = result.get("recommended_developer_email")
    if recommended:
        recommended = recommended.strip()
        # 1. Try canonical email match (case-insensitive)
        dev = db.query(Developer).filter(Developer.canonical_email.ilike(recommended)).first()
        
        # 2. Try github username match (case-insensitive)
        if not dev:
            dev = db.query(Developer).filter(Developer.github_username.ilike(recommended)).first()
            
        # 3. Try name match (case-insensitive)
        if not dev:
            dev = db.query(Developer).filter(Developer.name.ilike(recommended)).first()
            
        # 4. Try wildcard search on name, github username, or email
        if not dev:
            dev = db.query(Developer).filter(
                (Developer.name.ilike(f"%{recommended}%")) |
                (Developer.github_username.ilike(f"%{recommended}%")) |
                (Developer.canonical_email.ilike(f"%{recommended}%"))
            ).first()
    
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
