from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
import hmac
import hashlib
from packages.domain import schemas
from packages.agents.orchestrator import trigger_ingestion_agent

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

def verify_signature(payload_body: bytes, secret_token: str, signature_header: str):
    if not signature_header:
        raise HTTPException(status_code=403, detail="x-hub-signature-256 header is missing!")
    hash_object = hmac.new(secret_token.encode('utf-8'), msg=payload_body, digestmod=hashlib.sha256)
    expected_signature = "sha256=" + hash_object.hexdigest()
    if not hmac.compare_digest(expected_signature, signature_header):
        raise HTTPException(status_code=403, detail="Request signatures didn't match!")

@router.post("/github/{owner}/{repo_name}")
async def github_webhook(
    owner: str,
    repo_name: str,
    request: Request,
    background_tasks: BackgroundTasks
):
    repo_id = f"{owner}/{repo_name}"
    
    payload = await request.json()
    event = request.headers.get("X-GitHub-Event")
    
    print(f"[WEBHOOK] Received {event} event for {repo_id}")
    
    # We use FastAPI background tasks instead of Celery for this local setup
    background_tasks.add_task(trigger_ingestion_agent, repo_id, event, payload)
    
    print(f"[WEBHOOK] Queued IngestorAgent task for {repo_id}")
    return {"status": "accepted"}
