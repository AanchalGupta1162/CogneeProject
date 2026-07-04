from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from packages.shared.database import get_db
from packages.domain import models, schemas
from apps.api.dependencies import get_current_user
# We will import the agent triggering logic
# from packages.agents.orchestrator import trigger_assignment_agent

router = APIRouter(prefix="/tickets", tags=["tickets"])

@router.post("/", response_model=schemas.TicketResponse)
def create_ticket(
    ticket_in: schemas.TicketCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    ticket = models.Ticket(
        organization_id=current_user.organization_id,
        repository_id=ticket_in.repository_id,
        title=ticket_in.title,
        description=ticket_in.description,
        severity=ticket_in.severity,
        reporter_id=current_user.id
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # In a real setup, we enqueue a Celery task or background task to trigger the AssignerAgent
    # trigger_assignment_agent.delay(ticket.id)
    
    return ticket

@router.get("/", response_model=List[schemas.TicketResponse])
def get_tickets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    tickets = db.query(models.Ticket).filter(models.Ticket.organization_id == current_user.organization_id).all()
    return tickets

@router.get("/{ticket_id}", response_model=schemas.TicketDetailResponse)
def get_ticket(ticket_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id, 
        models.Ticket.organization_id == current_user.organization_id
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket
