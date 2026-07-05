from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from packages.shared.database import get_db
from packages.domain import models, schemas
from apps.api.dependencies import get_current_user
from packages.agents.orchestrator import trigger_assignment_agent

router = APIRouter(prefix="/tickets", tags=["tickets"])

@router.post("/", response_model=schemas.TicketResponse)
def create_ticket(
    ticket_in: schemas.TicketCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    repo_id = ticket_in.repository_id
    if repo_id and "/" in repo_id:
        # Resolve repository name to ID
        repo = db.query(models.Repository).filter(models.Repository.name == repo_id).first()
        if repo:
            repo_id = repo.id
        else:
            raise HTTPException(status_code=404, detail=f"Repository '{repo_id}' not found")

    ticket = models.Ticket(
        organization_id=current_user.organization_id,
        repository_id=repo_id,
        title=ticket_in.title,
        description=ticket_in.description,
        severity=ticket_in.severity,
        reporter_id=current_user.id
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # The AssignerAgent will be triggered by the rate-limited background task in main.py
    
    return ticket

@router.get("/", response_model=List[schemas.TicketResponse])
def get_tickets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    tickets = db.query(models.Ticket).filter(models.Ticket.organization_id == current_user.organization_id).all()
    
    devs = {d.id: d.name for d in db.query(models.Developer).all()}
    
    response = []
    for t in tickets:
        t_dict = {c.name: getattr(t, c.name) for c in t.__table__.columns}
        t_dict["assigned_developer_name"] = devs.get(t.assigned_developer_id, None) if t.assigned_developer_id else None
        response.append(t_dict)
        
    return response

@router.get("/{ticket_id}", response_model=schemas.TicketDetailResponse)
def get_ticket(ticket_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id, 
        models.Ticket.organization_id == current_user.organization_id
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.post("/{ticket_id}/approve")
def approve_ticket(ticket_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id,
        models.Ticket.organization_id == current_user.organization_id
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket.status != "pending_approval":
        raise HTTPException(status_code=400, detail="Ticket is not pending approval")
        
    ticket.status = "assigned"
    db.commit()
    return {"message": "Ticket approved successfully"}

@router.post("/{ticket_id}/reject")
def reject_ticket(ticket_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id,
        models.Ticket.organization_id == current_user.organization_id
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket.status != "pending_approval":
        raise HTTPException(status_code=400, detail="Ticket is not pending approval")
        
    ticket.status = "triage"
    ticket.assigned_developer_id = None
    db.commit()
    return {"message": "Ticket rejected and moved to triage"}
