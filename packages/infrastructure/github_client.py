from github import Github
from packages.shared.config import settings

class GithubClient:
    def __init__(self):
        # Authenticate using the token from settings, or fall back to unauthenticated if empty
        if settings.GITHUB_TOKEN:
            self.client = Github(settings.GITHUB_TOKEN)
        else:
            self.client = Github()

    def get_repo_commits(self, repo_name: str, limit: int = 10):
        """
        Fetches the recent commits from a repository.
        repo_name should be in the format 'owner/repo', e.g., 'Harshavardhan-28/cognee_test'
        """
        repo = self.client.get_repo(repo_name)
        commits = repo.get_commits()
        
        results = []
        for commit in commits[:limit]:
            results.append({
                "sha": commit.sha,
                "author_name": commit.commit.author.name,
                "author_email": commit.commit.author.email,
                "message": commit.commit.message,
                "url": commit.html_url,
                "date": commit.commit.author.date.isoformat()
            })
        return results

    def get_commit_files(self, repo_name: str, commit_sha: str):
        """
        Fetches the files modified in a specific commit.
        """
        repo = self.client.get_repo(repo_name)
        commit = repo.get_commit(commit_sha)
        
        files = []
        for file in commit.files:
            files.append({
                "filename": file.filename,
                "status": file.status,
                "additions": file.additions,
                "deletions": file.deletions,
                "patch": file.patch # The actual diff
            })
        return files

github_client = GithubClient()
