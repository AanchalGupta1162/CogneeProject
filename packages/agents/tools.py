from google.adk.tools import FunctionTool as Tool
from packages.infrastructure.cognee_client import memory_service
from packages.infrastructure.github_client import github_client
import json

async def search_memory(query: str, dataset_name: str) -> str:
    """Search the Cognee memory graph for commits, files, and developers in a specific repository."""
    results = await memory_service.search(dataset_name, query)
    return json.dumps(results) if results else "[]"

search_memory_tool = Tool(func=search_memory)

async def add_to_memory(dataset_name: str, data: str) -> str:
    """Add repository data (commits, PRs) to the memory graph."""
    await memory_service.add_repository_data(dataset_name, data)
    return "Data added successfully."

add_to_memory_tool = Tool(func=add_to_memory)

async def fetch_github_commit_files(repo_name: str, commit_sha: str) -> str:
    """Fetch the files modified in a specific GitHub commit, including the patch diffs."""
    files = github_client.get_commit_files(repo_name, commit_sha)
    return json.dumps(files)

fetch_github_commit_files_tool = Tool(func=fetch_github_commit_files)
