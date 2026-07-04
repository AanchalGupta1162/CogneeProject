# Smart Ticketing Platform

A multi-agent system built with Google ADK, Cognee, FastAPI, and Next.js.

## Architecture

- **Web Portal**: Next.js app for creating tickets and onboarding repositories.
- **API Backend**: FastAPI application exposing endpoints and receiving webhooks.
- **Local Memory**: Cognee instances managing graph memory for repositories.
- **Multi-Agent System**:
  - `IngestorAgent`: Processes commits and PRs, storing data via Cognee.
  - `AssignerAgent`: Assigns new tickets by recalling context from Cognee.

## Setup Instructions

1. **Environment Variables**:
   Copy the `packages/shared/config.py` defaults or create a `.env` file at the root.
   ```env
   GOOGLE_API_KEY="your_api_key_here"
   ```

2. **Run Services**:
   ```bash
   make build
   make up
   ```

3. **Development (Backend)**:
   ```bash
   make setup
   make dev-api
   ```

4. **Development (Frontend)**:
   ```bash
   make dev-web
   ```
