import cognee
from packages.shared.config import settings

class CogneeMemoryService:
    def __init__(self):
        pass

    async def setup(self):
        """Initializes the cognee client."""
        # If running locally, we don't need serve unless we're connecting to cloud.
        # But we must configure the LLM provider.
        # This will be handled by cognee's environment variables usually (LLM_API_KEY).
        import os
        if settings.GOOGLE_API_KEY:
            os.environ["LLM_API_KEY"] = settings.GOOGLE_API_KEY
            os.environ["LLM_PROVIDER"] = "gemini" # Assuming cognee supports gemini via litellm or directly
        
        # We start with a clean slate for the prototype if needed, but in production we don't.
        # await cognee.forget(everything=True) 

    async def add_repository_data(self, dataset_name: str, data: str):
        """Adds code or commit data to the specific repository dataset."""
        await cognee.add(data, dataset_name=dataset_name)

    async def cognify_repository(self, dataset_name: str):
        """Processes the added data into a knowledge graph."""
        # cognify expects dataset names
        await cognee.cognify(datasets=[dataset_name])

    async def search(self, dataset_name: str, query: str):
        """Searches the knowledge graph."""
        # We can use recall which auto-routes
        # But recall might not accept dataset_name as easily as passing it to the global context? 
        # Actually in Cognee v1.0, recall searches across all, or we use search with datasets parameter.
        results = await cognee.search(
            query_text=query,
            query_type="GRAPH_COMPLETION",
            datasets=[dataset_name]
        )
        return results

    async def recall(self, query: str):
        """Generic recall across datasets"""
        results = await cognee.recall(query_text=query)
        return results

memory_service = CogneeMemoryService()
