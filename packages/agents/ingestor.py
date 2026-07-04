from google.adk import Agent as LlmAgent
from packages.agents.tools import add_to_memory_tool, fetch_github_commit_files_tool
import json

class IngestorAgent:
    def __init__(self):
        self.agent = LlmAgent(
            name="IngestorAgent",
            instructions="""
            You are the IngestorAgent for a smart ticketing platform.
            Your job is to receive webhook payloads (like commits or PRs), 
            extract meaningful information (files changed, commit messages, author details).
            If the payload is a commit push event, you must use the fetch_github_commit_files tool
            to fetch the actual file diffs/patches for the commit.
            Then, summarize all the data (commit message, author, diffs) and
            add it to the repository's memory graph using the add_to_memory tool.
            Format the data as a clean, semantic summary before adding it.
            """,
            tools=[add_to_memory_tool, fetch_github_commit_files_tool]
        )

    async def run(self, repo_id: str, payload: dict):
        prompt = f"Process this webhook payload for repo {repo_id}: {json.dumps(payload)}"
        response = await self.agent.run(prompt)
        return response
