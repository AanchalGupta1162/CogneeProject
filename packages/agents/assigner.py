from google.adk.agents import Agent as LlmAgent
from google.adk.runners import InMemoryRunner
from google.genai import types
from packages.agents.tools import search_memory_tool
import json
import uuid

class AssignerAgent:
    def __init__(self):
        self.agent = LlmAgent(
            name="AssignerAgent",
            model="gemini-2.5-flash",
            instruction="""
            You are the AssignerAgent. A new ticket has been reported.
            Your job is to recommend the best developer to fix this issue.
            Use the search_memory tool to query the repository's knowledge graph.
            Look for developers who have authored commits related to the keywords in the ticket.
            Return a JSON object containing:
            - recommended_developer_email
            - confidence_score (0-100)
            - reasoning
            - evidence (dict of commits/files)
            """,
            tools=[search_memory_tool]
        )

    async def run(self, ticket_id: str, repo_id: str, title: str, description: str):
        prompt = f"Ticket ID: {ticket_id}\nRepo ID: {repo_id}\nTitle: {title}\nDescription: {description}\nAnalyze memory and recommend a developer."
        
        session_id = str(uuid.uuid4())
        runner = InMemoryRunner(agent=self.agent, app_name="ticket_app")
        await runner.session_service.create_session(
            app_name="ticket_app",
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

        # Parse the JSON response
        try:
            # Assuming agent returns valid JSON or markdown JSON
            result = json.loads(final_response.strip().strip('```json').strip('```'))
            return result
        except Exception:
            return {
                "recommended_developer_email": None,
                "confidence_score": 0,
                "reasoning": "Failed to parse agent response.",
                "evidence": {}
            }
