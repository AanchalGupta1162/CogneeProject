from google.adk import Agent as LlmAgent
from packages.agents.tools import search_memory_tool
import json

class AssignerAgent:
    def __init__(self):
        self.agent = LlmAgent(
            name="AssignerAgent",
            model="gemini-3.5-flash",
            instructions="""
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
        response = await self.agent.run(prompt)
        # Parse the JSON response
        try:
            # Assuming agent returns valid JSON or markdown JSON
            result = json.loads(response.strip().strip('```json').strip('```'))
            return result
        except Exception:
            return {
                "recommended_developer_email": None,
                "confidence_score": 0,
                "reasoning": "Failed to parse agent response.",
                "evidence": {}
            }
