import asyncio
import os
import signal
import time
import logging

logging.basicConfig(level=logging.INFO)

async def main():
    print("Starting Cognee UI and Backend...")
    # Configure shared Cognee data directory so UI and Docker see the same DB
    # MUST be set BEFORE importing cognee!
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    from dotenv import load_dotenv
    load_dotenv(os.path.join(repo_root, ".env"))

    cognee_data_dir = os.path.join(repo_root, ".cognee_data")
    os.environ["DATA_ROOT_DIRECTORY"] = os.path.join(cognee_data_dir, "data")
    os.environ["SYSTEM_ROOT_DIRECTORY"] = os.path.join(cognee_data_dir, "system")
    os.environ["CACHE_ROOT_DIRECTORY"] = os.path.join(cognee_data_dir, "cache")

    import cognee

    # Tell the Next.js frontend where the backend is
    os.environ["NEXT_PUBLIC_LOCAL_API_URL"] = "http://localhost:8001"
    # Tell the Backend API to allow CORS requests from our UI port
    os.environ["UI_APP_URL"] = "http://localhost:3001"
    # Disable access control for the UI local backend
    os.environ["ENABLE_BACKEND_ACCESS_CONTROL"] = "false"
    
    child_pids = []
    server = cognee.start_ui(
        pid_callback=child_pids.append,
        port=3001,
        open_browser=False,
        start_backend=True,
        backend_port=8001,
    )

    if server:
        print("\n=======================================================")
        print("✅ Cognee Local UI is running!")
        print("🌐 Open your browser to: http://localhost:3001")
        print("=======================================================\n")
        print("Press Ctrl+C to stop...")
        try:
            while server.poll() is None:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nShutting down Cognee UI...")
            server.terminate()
            server.wait()
            for pid in child_pids:
                if pid != server.pid:
                    try:
                        os.kill(pid, signal.SIGTERM)
                    except OSError:
                        pass
    else:
        print("Failed to start the UI server.")

if __name__ == "__main__":
    asyncio.run(main())
