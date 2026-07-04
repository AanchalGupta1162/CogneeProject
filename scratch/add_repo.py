import sys
from packages.shared.database import SessionLocal
from packages.domain.models import Organization, Repository
import secrets

def add_repo(repo_name: str):
    db = SessionLocal()
    
    org = db.query(Organization).first()
    if not org:
        org = Organization(name="Default Org")
        db.add(org)
        db.commit()
        db.refresh(org)
        print(f"Created Default Organization: {org.id}")

    repo = db.query(Repository).filter(Repository.name == repo_name).first()
    if repo:
        print(f"Repository {repo_name} already exists. ID: {repo.id}")
    else:
        # Generate a random webhook secret for this repo
        webhook_secret = secrets.token_hex(16)
        repo = Repository(
            organization_id=org.id,
            name=repo_name,
            provider="github",
            webhook_secret=webhook_secret
        )
        db.add(repo)
        db.commit()
        db.refresh(repo)
        print(f"Successfully added repository!")
        print(f"Repo ID: {repo.id}")
        print(f"Repo Name: {repo.name}")
        print(f"Webhook Secret: {repo.webhook_secret}")
    
    db.close()

if __name__ == "__main__":
    add_repo("Harshavardhan-28/cognee_test")
