import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from packages.shared.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="organization")
    repositories = relationship("Repository", back_populates="organization")
    tickets = relationship("Ticket", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="developer") # admin, manager, developer, reporter
    organization_id = Column(String, ForeignKey("organizations.id"))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="users")
    developer_profile = relationship("Developer", back_populates="user", uselist=False)

class Developer(Base):
    __tablename__ = "developers"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    canonical_email = Column(String, unique=True, index=True)
    name = Column(String)
    github_username = Column(String, unique=True, nullable=True)

    user = relationship("User", back_populates="developer_profile")

class Repository(Base):
    __tablename__ = "repositories"
    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"))
    name = Column(String, nullable=False)
    provider = Column(String, default="github")
    webhook_secret = Column(String)
    sync_status = Column(String, default="pending")
    last_sync_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="repositories")
    tickets = relationship("Ticket", back_populates="repository")

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"))
    repository_id = Column(String, ForeignKey("repositories.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(String)
    status = Column(String, default="open") # open, assigned, triage, closed
    severity = Column(String, default="medium")
    reporter_id = Column(String, ForeignKey("users.id"), nullable=True)
    assigned_developer_id = Column(String, ForeignKey("developers.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="tickets")
    repository = relationship("Repository", back_populates="tickets")
    recommendations = relationship("AssignmentRecommendation", back_populates="ticket")

class AssignmentRecommendation(Base):
    __tablename__ = "assignment_recommendations"
    id = Column(String, primary_key=True, default=generate_uuid)
    ticket_id = Column(String, ForeignKey("tickets.id"))
    recommended_developer_id = Column(String, ForeignKey("developers.id"))
    confidence_score = Column(Integer)
    reasoning = Column(String)
    evidence = Column(JSON) # stores paths, commit SHAs, etc.
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    ticket = relationship("Ticket", back_populates="recommendations")
    developer = relationship("Developer")
