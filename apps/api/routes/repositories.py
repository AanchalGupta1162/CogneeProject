from fastapi import APIRouter, BackgroundTasks
from packages.agents.orchestrator import trigger_historical_sync

router = APIRouter(prefix="/repositories", tags=["repositories"])

@router.post("/{owner}/{repo_name}/sync")
async def sync_repository(owner: str, repo_name: str, background_tasks: BackgroundTasks, limit: int = 10):
    repo_id = f"{owner}/{repo_name}"
    # Instead of celery for this demo, we'll just use fastapi background tasks
    # because Celery isn't running in our demo setup right now.
    background_tasks.add_task(trigger_historical_sync, repo_id, limit)
    
    return {"status": "accepted", "message": f"Sync started for {repo_id}."}
