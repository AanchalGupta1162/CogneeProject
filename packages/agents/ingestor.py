from google.adk.agents import Agent as LlmAgent
from google.adk.runners import InMemoryRunner
from google.genai import types
from packages.agents.tools import add_to_memory_tool, fetch_github_commit_files_tool
import json
import uuid

class IngestorAgent:
    def __init__(self):
        self.agent = LlmAgent(
            name="IngestorAgent",
            model="gemini-2.5-flash",
            instruction="""
            You are the IngestorAgent for a smart ticketing platform.
            Your job is to receive clean webhook payloads.
            For each commit in the payload:
            1. Use the fetch_github_commit_files tool to fetch the file diffs/patches for the commit.
            2. Summarize the commit message, author, and code changes into a single comprehensive semantic document.
            3. Use the add_to_memory tool to save this document to the repository's graph.
            """,
            tools=[add_to_memory_tool, fetch_github_commit_files_tool]
        )

    async def run(self, repo_id: str, payload: dict):
        prompt = f"Process this webhook payload for repo {repo_id}: {json.dumps(payload)}"
        
        session_id = str(uuid.uuid4())
        runner = InMemoryRunner(agent=self.agent, app_name="ingest_app")
        await runner.session_service.create_session(
            app_name="ingest_app",
            user_id="system",
            session_id=session_id,
        )

        final_response = ""
        async for event in runner.run_async(
            user_id="system",
            session_id=session_id,
            new_message=types.Content(
                role="user",
                parts=[types.Part(text=prompt)],
            ),
        ):
            if event.is_final_response() and event.content and event.content.parts:
                final_response = event.content.parts[0].text

        return final_response
