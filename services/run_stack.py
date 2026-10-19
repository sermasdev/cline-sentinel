import os
import sys
import time
import subprocess
import signal

BASE_DIR = "/home/admin/hermes-sentinel"
VENV_PYTHON = f"{BASE_DIR}/.venv/bin/python3"
LOGS_DIR = f"{BASE_DIR}/runtime/logs"
os.makedirs(LOGS_DIR, exist_ok=True)

processes = []

def start_service(name, cmd, cwd=BASE_DIR):
    log_file = open(f"{LOGS_DIR}/{name}.log", "a")
    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        stdout=log_file,
        stderr=subprocess.STDOUT,
        env={**os.environ, "PYTHONPATH": BASE_DIR}
    )
    print(f"[+] Started {name} (PID: {proc.pid})")
    processes.append((name, proc, log_file))
    return proc

def main():
    print("[*] Launching HERMES SENTINEL Services...")

    # 1. API Server (Port 8000)
    start_service("sentinel-api", [VENV_PYTHON, "-m", "uvicorn", "services.api.main:app", "--host", "0.0.0.0", "--port", "8000"])
    
    # 2. Web & MCP Decoy (Port 8088)
    start_service("sentinel-web-decoy", [VENV_PYTHON, "-m", "uvicorn", "services.web-decoy.web_decoy:app", "--host", "0.0.0.0", "--port", "8088"])

    # 3. SSH Decoy (Port 2222)
    start_service("sentinel-ssh-decoy", [VENV_PYTHON, "services/cowrie_decoy/ssh_decoy.py"])

    # 4. React Dashboard (Port 3000)
    start_service("sentinel-dashboard", ["npm", "run", "dev"], cwd=f"{BASE_DIR}/services/dashboard")

    time.sleep(3)
    print("[*] All services dispatched. Monitoring processes...")

    def cleanup(signum, frame):
        print("\n[*] Terminating services...")
        for name, p, log in processes:
            p.terminate()
            log.close()
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    while True:
        for name, p, _ in processes:
            ret = p.poll()
            if ret is not None:
                print(f"[!] Warning: {name} exited with code {ret}")
        time.sleep(5)

if __name__ == "__main__":
    main()
