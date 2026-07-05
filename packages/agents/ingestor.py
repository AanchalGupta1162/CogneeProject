import json
from packages.infrastructure.github_client import github_client
from packages.infrastructure.cognee_client import memory_service

class IngestorAgent:
    def __init__(self):
        pass

    async def run(self, repo_id: str, payload: dict):
        commits = payload.get("commits", [])
        if not commits:
            return "No commits found in payload."

        print(f"[INGESTOR] Processing {len(commits)} commits for {repo_id}...")
        
        for i, commit in enumerate(commits):
            sha = commit.get("id") or commit.get("sha")
            if not sha:
                continue
                
            print(f"[INGESTOR] Extracting commit {i+1}/{len(commits)}: {sha[:7]}")
            
            author = commit.get("author", {})
            author_name = author.get("name", "Unknown")
            author_email = author.get("email", "unknown@example.com")
            
            md = f"# Commit: {commit.get('message', 'No message')}\n\n"
            md += f"**Repository**: {repo_id}\n"
            md += f"**Author**: {author_name} ({author_email})\n"
            md += f"**Date**: {commit.get('timestamp', 'Unknown')}\n"
            md += f"**SHA**: {sha}\n\n"
            
            try:
                files = github_client.get_commit_files(repo_id, sha)
                if files:
                    md += "## Modified Files\n\n"
                    for f in files:
                        md += f"### {f.get('filename')} ({f.get('status')})\n"
                        md += f"Changes: +{f.get('additions', 0)} / -{f.get('deletions', 0)}\n\n"
                        if f.get('patch'):
                            md += "```diff\n"
                            md += f['patch']
                            md += "\n```\n\n"
            except Exception as e:
                print(f"[INGESTOR] Error fetching files for commit {sha}: {e}")

            # Upsert developer to local database
            if author_email and author_email != "unknown@example.com":
                from packages.shared.database import SessionLocal
                from packages.domain.models import Developer
                import uuid
                
                db = SessionLocal()
                try:
                    dev = db.query(Developer).filter(Developer.canonical_email == author_email).first()
                    if not dev:
                        print(f"[INGESTOR] Auto-creating developer record for {author_name} ({author_email})")
                        dev = Developer(
                            id=str(uuid.uuid4()),
                            name=author_name,
                            canonical_email=author_email,
                            github_username=author_name
                        )
                        db.add(dev)
                        db.commit()
                finally:
                    db.close()

            # Add this rich markdown document to Cognee
            await memory_service.add_repository_data(repo_id, md)
            
        print(f"[INGESTOR] All {len(commits)} commits added to memory buffer. Cognifying dataset now...")
        await memory_service.cognify_repository(repo_id)
        print(f"[INGESTOR] Cognify complete for {repo_id}! Graph is ready.")

        return f"Successfully processed {len(commits)} commits and updated the graph."
