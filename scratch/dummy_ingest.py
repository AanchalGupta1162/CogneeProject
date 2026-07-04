import os
from dotenv import load_dotenv

# Explicitly point to the .env file in the root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

google_api_key = os.environ.get("GOOGLE_API_KEY", "")

# We need to tell Cognee to use Gemini and pass the API key it expects
# THIS MUST HAPPEN BEFORE IMPORTING COGNEE!
os.environ["LLM_PROVIDER"] = "gemini"
os.environ["LLM_MODEL"] = "gemini/gemini-3.5-flash"
os.environ["LLM_API_KEY"] = google_api_key

os.environ["EMBEDDING_PROVIDER"] = "gemini"
os.environ["EMBEDDING_MODEL"] = "gemini/gemini-embedding-001"
os.environ["EMBEDDING_API_KEY"] = google_api_key
os.environ["EMBEDDING_DIMENSIONS"] = "768"

import asyncio
import cognee

async def main():
    print(f"Loaded API Key? {'Yes' if google_api_key else 'No'}")
    print("Ingesting sample code architecture data into Cognee...")
    
    # Add some sample knowledge nodes about the repository
    await cognee.add(
        "The smart-ticket repository contains a backend built with FastAPI and a frontend built with Next.js."
    )
    await cognee.add(
        "IngestorAgent is a Python class responsible for receiving webhook payloads from GitHub and processing them."
    )
    await cognee.add(
        "AssignerAgent is a Python class that evaluates the commit history to assign the best developer to a ticket."
    )
    await cognee.add(
        "Both IngestorAgent and AssignerAgent use the Google ADK and depend on the Cognee memory graph."
    )
    
    print("Building the knowledge graph (Cognifying)...")
    await cognee.cognify()
    
    print("Done! The graph has been generated.")

if __name__ == "__main__":
    asyncio.run(main())
