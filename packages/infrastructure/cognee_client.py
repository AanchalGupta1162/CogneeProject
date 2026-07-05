import cognee
from cognee.api.v1.search import SearchType
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
        
        # Connect to Cognee Cloud or the Local UI Backend running on port 8001
        if settings.COGNEE_BASE_URL:
            if settings.COGNEE_API_KEY:
                await cognee.serve(url=settings.COGNEE_BASE_URL, api_key=settings.COGNEE_API_KEY)
            else:
                await cognee.serve(url=settings.COGNEE_BASE_URL)
        else:
            # Connect to the local UI backend so they share the exact same instance and graph
            await cognee.serve(url="http://localhost:8001")

    async def add_repository_data(self, dataset_name: str, data: str):
        """Adds code or commit data to the specific repository dataset."""
        import httpx
        import uuid
        url = f"{settings.COGNEE_BASE_URL or 'http://localhost:8001'}/api/v1/add"
        headers = {"X-Tenant-Id": "local"}
        if settings.COGNEE_API_KEY:
            headers["X-Api-Key"] = settings.COGNEE_API_KEY
        
        file_name = f"commit_data_{uuid.uuid4().hex[:8]}.txt"
        
        # We must pass string data as a file to the multipart endpoint
        files = {
            "data": (file_name, data.encode('utf-8'), "text/plain")
        }
        form_data = {
            "datasetName": dataset_name
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(url, files=files, data=form_data, headers=headers)
            resp.raise_for_status()

    async def add_repository_url(self, dataset_name: str, github_url: str):
        """Adds a GitHub repository URL directly to Cognee."""
        import httpx
        url = f"{settings.COGNEE_BASE_URL or 'http://localhost:8001'}/api/v1/add"
        headers = {"X-Tenant-Id": "local"}
        if settings.COGNEE_API_KEY:
            headers["X-Api-Key"] = settings.COGNEE_API_KEY
        
        # The /add endpoint strictly requires a List[UploadFile].
        # By providing a dummy filename, FastAPI will parse this multipart chunk as an UploadFile
        # rather than a plain string, satisfying the validation schema.
        files = {
            "data": ("url.txt", github_url.encode('utf-8'), "text/plain")
        }
        form_data = {
            "datasetName": dataset_name
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(url, files=files, data=form_data, headers=headers)
            if resp.status_code >= 400:
                print(f"Error from Cognee API: {resp.text}")
            resp.raise_for_status()

    async def cognify_repository(self, dataset_name: str):
        """Processes the added data into a knowledge graph."""
        import httpx
        url = f"{settings.COGNEE_BASE_URL or 'http://localhost:8001'}/api/v1/cognify"
        headers = {"X-Tenant-Id": "local"}
        if settings.COGNEE_API_KEY:
            headers["X-Api-Key"] = settings.COGNEE_API_KEY
            
        payload = {
            "datasets": [dataset_name]
        }
        
        async with httpx.AsyncClient(timeout=300.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()

    async def search(self, dataset_name: str, query: str):
        """Searches the knowledge graph."""
        import httpx
        url = f"{settings.COGNEE_BASE_URL or 'http://localhost:8001'}/api/v1/search"
        headers = {"X-Tenant-Id": "local"}
        if settings.COGNEE_API_KEY:
            headers["X-Api-Key"] = settings.COGNEE_API_KEY
            
        payload = {
            "query": query,
            "searchType": "GRAPH_COMPLETION",
            "datasets": [dataset_name]
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code >= 400:
                print(f"Error from Cognee API (search): {resp.status_code} - {resp.text}")
            resp.raise_for_status()
            return resp.json()

    async def recall(self, query: str):
        """Generic recall across datasets"""
        results = await cognee.recall(query_text=query)
        return results

memory_service = CogneeMemoryService()
