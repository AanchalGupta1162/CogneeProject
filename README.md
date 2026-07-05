# Smart Ticket AI

Welcome to **Smart Ticket AI**! This is an autonomous ticketing system powered by Google Agent Development Kit (ADK), Cognee Cloud, Next.js, and FastAPI.

The system autonomously assigns incoming bugs or feature requests to the most relevant developer by maintaining a real-time semantic knowledge graph of your GitHub repositories.

---

## Prerequisites

Before running the application, ensure you have the following installed on your machine:
- [Docker & Docker Compose](https://www.docker.com/) (For PostgreSQL database)
- [Python 3.10+](https://www.python.org/)
- [Node.js 18+ & npm](https://nodejs.org/)
- [ngrok](https://ngrok.com/) (For exposing your local backend to GitHub webhooks)

---

## 1. Environment Setup

At the root of the project, create a `.env` file for the backend:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smart_ticket

# LLM / AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Cognee Cloud
COGNEE_API_KEY=your_cognee_api_key_here

# GitHub
GITHUB_TOKEN=your_github_personal_access_token_here
```

In the `apps/web` folder, edit the `.env.local` file for the Next.js frontend:

```env
GITHUB_ID="your_github_oauth_app_client_id"
GITHUB_SECRET="your_github_oauth_app_client_secret"
NEXTAUTH_SECRET="a_random_secure_string_here"
NEXTAUTH_URL="http://localhost:3000"
```
*(To get GitHub OAuth credentials: go to GitHub -> Settings -> Developer settings -> OAuth Apps. Set homepage to `http://localhost:3000` and callback to `http://localhost:3000/api/auth/callback/github`)*

---

## 2. Running the Application

This project uses a `Makefile` to easily spin up all required services.

### Step 1: Start the Database
Spin up the PostgreSQL database using Docker Compose:
```bash
make up
```

### Step 2: Install Dependencies
Install both Python and Node.js dependencies:
```bash
make setup
```

### Step 3: Run the Backend (FastAPI)
In a new terminal window, activate the Python virtual environment and start the Python backend (runs on port 8000):
```bash
source venv/bin/activate
make dev-api
```

### Step 4: Run the Frontend (Next.js)
In a new terminal window, start the web interface (runs on port 3000):
```bash
make dev-web
```

### Step 5: Run the Cognee Local UI (Optional)
If you want to visually inspect the AI's semantic knowledge graph locally, you can start the Cognee Studio interface in a new terminal window (ensure the venv is activated):
```bash
source venv/bin/activate
make cognee-ui
```
This will spin up a local server. You can view your graph by navigating your browser to `http://0.0.0.0:8000/` (or whichever port it outputs).

---

## 3. GitHub Webhook Setup (ngrok)

For GitHub to send real-time push and PR events to your local machine, you must expose your local backend (port 8000) to the internet using `ngrok`.

### Start ngrok
In a new terminal, run:
```bash
ngrok http 8000
```

Ngrok will provide you with a "Forwarding" URL (e.g., `https://1234-abcd.ngrok-free.dev`).

### Configure GitHub
1. Go to your target GitHub repository on GitHub.com.
2. Navigate to **Settings -> Webhooks -> Add webhook**.
3. **Payload URL**: `https://<YOUR_NGROK_URL>/webhooks/github/{owner}/{repo}` *(replace `{owner}` and `{repo}` with your exact repository details)*.
4. **Content type**: `application/json`.
5. Select **Just the push event** (or send me everything).
6. Click **Add webhook**.

---

## 4. Usage Flow

1. Open your browser and go to `http://localhost:3000`.
2. **Historical Sync**: Log in, navigate to **Admin Setup**, and trigger a historical sync for your repository to build the initial knowledge graph in Cognee.
3. **Raise a Ticket**: Log in as a Client and create a new ticket in the UI.
4. **Autonomous Assignment**: In the background, the `AssignerAgent` will analyze the ticket, query the Cognee graph, and assign it to the developer who last touched the relevant code.
5. **Developer Dashboard**: Log in via GitHub as a Developer. If a ticket is assigned to you, you will see a real-time Toast notification and can view the exact AI reasoning and evidence for the assignment!

---

## 5. Shutting Down

When you are done, you can stop the web servers using `Ctrl+C`. 
To spin down the database, run:
```bash
make down
```

For a detailed dive into how the AI agents operate, please refer to [ARCHITECTURE.md](./ARCHITECTURE.md).
