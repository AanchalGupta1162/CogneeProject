from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    organization_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TicketCreate(BaseModel):
    title: str
    description: str
    repository_id: Optional[str] = None
    severity: str = "medium"

class TicketResponse(BaseModel):
    id: str
    title: str
    description: str
    status: str
    severity: str
    assigned_developer_id: Optional[str]
    assigned_developer_name: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AssignmentResult(BaseModel):
    ticket_id: str
    recommended_developer_id: Optional[str]
    confidence_score: int
    reasoning: str
    evidence: Dict[str, Any]

class TicketDetailResponse(TicketResponse):
    recommendations: List[AssignmentResult] = []
    
    class Config:
        from_attributes = True

class RepositoryCreate(BaseModel):
    name: str
    provider: str = "github"

class RepositoryResponse(BaseModel):
    id: str
    name: str
    provider: str
    sync_status: str
    
    class Config:
        from_attributes = True

class WebhookPayload(BaseModel):
    action: str
    repository: Dict[str, Any]
    sender: Dict[str, Any]
    pull_request: Optional[Dict[str, Any]] = None
    commits: Optional[List[Dict[str, Any]]] = None
