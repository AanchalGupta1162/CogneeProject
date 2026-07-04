import asyncio
import os
import signal
import time
import cognee
import logging

logging.basicConfig(level=logging.INFO)

async def main():
    print("Starting Cognee UI and Backend...")
    # Tell the Next.js frontend where the backend is
    os.environ["NEXT_PUBLIC_LOCAL_API_URL"] = "http://localhost:8001"
    # Tell the Backend API to allow CORS requests from our UI port
    os.environ["UI_APP_URL"] = "http://localhost:3001"
    
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
