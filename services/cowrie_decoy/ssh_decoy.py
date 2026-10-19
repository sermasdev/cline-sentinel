import os
import sys
import time
import uuid
import socket
import threading
import datetime
import paramiko
from sentinel_core.config import settings
from sentinel_core.db import SessionLocal
from sentinel_core.schemas import EventCreate
from sentinel_core.event_pipeline import event_pipeline

HOST_KEY_PATH = "/home/admin/hermes-sentinel/runtime/honeypot_rsa.key"

def get_or_create_host_key():
    if not os.path.exists(HOST_KEY_PATH):
        os.makedirs(os.path.dirname(HOST_KEY_PATH), exist_ok=True)
        key = paramiko.RSAKey.generate(2048)
        key.write_private_key_file(HOST_KEY_PATH)
        return key
    return paramiko.RSAKey(filename=HOST_KEY_PATH)

class DecoySSHServer(paramiko.ServerInterface):
    def __init__(self, client_ip: str, client_port: int, session_id: str):
        self.client_ip = client_ip
        self.client_port = client_port
        self.session_id = session_id
        self.event = threading.Event()
        self.username = None

    def check_channel_request(self, kind, chanid):
        if kind == "session":
            return paramiko.OPEN_SUCCEEDED
        return paramiko.OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED

    def check_auth_password(self, username, password):
        self.username = username
        # Record authentication attempt
        now = datetime.datetime.now(datetime.timezone.utc)
        # We accept common passwords to lure into simulated shell for command recording
        success = password in ["root", "admin", "123456", "password", "toor", "sentinel"]
        
        evt = EventCreate(
            event_id=f"evt-{uuid.uuid4().hex[:12]}",
            timestamp=now,
            sensor_id="cowrie-local",
            sensor_type="ssh",
            event_type="authentication_success" if success else "authentication_failed",
            session_id=self.session_id,
            source_ip=self.client_ip,
            source_port=self.client_port,
            destination_port=settings.COWRIE_PORT,
            severity="medium" if success else "low",
            payload=f"SSH auth attempt user='{username}' pass='{password}'",
            metadata={"username": username, "password": password, "auth_success": success}
        )
        try:
            with SessionLocal() as db:
                event_pipeline.ingest_event(db, evt)
        except Exception as e:
            print(f"Error recording ssh auth: {e}")

        if success:
            return paramiko.AUTH_SUCCESSFUL
        return paramiko.AUTH_FAILED

    def check_channel_shell_request(self, channel):
        self.event.set()
        return True

    def check_channel_pty_request(self, channel, term, width, height, pixelwidth, pixelheight, modes):
        return True

def handle_ssh_session(client_sock, client_addr):
    client_ip, client_port = client_addr
    session_id = f"sess-ssh-{uuid.uuid4().hex[:8]}"
    transport = paramiko.Transport(client_sock)
    transport.local_version = "SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6"
    host_key = get_or_create_host_key()
    transport.add_server_key(host_key)

    server = DecoySSHServer(client_ip, client_port, session_id)
    try:
        transport.start_server(server=server)
    except Exception as e:
        transport.close()
        return

    channel = transport.accept(20)
    if not channel:
        transport.close()
        return

    server.event.wait(10)
    if not server.event.is_set():
        channel.close()
        transport.close()
        return

    # Interactive simulated shell
    channel.send("\r\nWelcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-89-generic x86_64)\r\n\r\n")
    channel.send("Last login: Mon Oct 19 14:22:01 2026 from 10.0.4.12\r\n")
    prompt = f"{server.username or 'root'}@corp-gateway:~# "
    channel.send(prompt)

    buffer = ""
    while not channel.closed:
        try:
            data = channel.recv(1024)
            if not data:
                break
            text = data.decode("utf-8", errors="ignore")
            for char in text:
                if char in ["\r", "\n"]:
                    channel.send("\r\n")
                    cmd = buffer.strip()
                    buffer = ""
                    if cmd:
                        output = run_simulated_command(cmd, server.username or "root")
                        if output:
                            channel.send(output + "\r\n")
                        # Log command execution event
                        now = datetime.datetime.now(datetime.timezone.utc)
                        evt = EventCreate(
                            event_id=f"evt-{uuid.uuid4().hex[:12]}",
                            timestamp=now,
                            sensor_id="cowrie-local",
                            sensor_type="ssh",
                            event_type="command_executed",
                            session_id=session_id,
                            source_ip=client_ip,
                            source_port=client_port,
                            destination_port=settings.COWRIE_PORT,
                            severity="high" if any(c in cmd for c in ["passwd", "shadow", "wget", "curl", "chmod"]) else "medium",
                            payload=cmd,
                            metadata={"output": output, "user": server.username}
                        )
                        with SessionLocal() as db:
                            event_pipeline.ingest_event(db, evt)

                        if cmd in ["exit", "logout"]:
                            channel.close()
                            break
                    channel.send(prompt)
                elif char in ["\x08", "\x7f"]:  # Backspace
                    if len(buffer) > 0:
                        buffer = buffer[:-1]
                        channel.send("\b \b")
                else:
                    buffer += char
                    channel.send(char)
        except Exception:
            break

    channel.close()
    transport.close()

def run_simulated_command(cmd: str, user: str) -> str:
    c = cmd.strip()
    if c in ["whoami"]:
        return user
    elif c in ["id"]:
        return f"uid=0({user}) gid=0({user}) groups=0({user})"
    elif c in ["uname -a"]:
        return "Linux corp-gateway 5.15.0-89-generic #99-Ubuntu SMP Fri Nov 3 14:00:00 UTC 2026 x86_64 GNU/Linux"
    elif c in ["ls", "ls -la"]:
        return "total 32\ndrwxr-xr-x 4 root root 4096 Oct 19 12:00 .\ndrwxr-xr-x 3 root root 4096 Oct 19 11:00 ..\n-rw------- 1 root root  240 Oct 19 12:05 .bash_history\n-rw-r--r-- 1 root root 1420 Oct 19 12:01 credentials.bak\n-rw-r--r-- 1 root root 8192 Oct 19 12:02 gateway.sqlite\n-rwxr-xr-x 1 root root  512 Oct 19 12:03 deploy.sh"
    elif "cat /etc/passwd" in c:
        return "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ndeploy:x:1000:1000:Deploy User:/home/deploy:/bin/bash\nbackup:x:1001:1001:Backup Service:/home/backup:/bin/bash"
    elif "cat /etc/shadow" in c:
        return "cat: /etc/shadow: Permission denied"
    elif c.startswith("cat "):
        return f"[decoy file content for {c[4:]}]"
    elif "wget" in c or "curl" in c:
        return "curl: (7) Failed to connect: Network is unreachable (outbound traffic prohibited by gateway policy)"
    return f"bash: {cmd}: command not found"

def start_ssh_honeypot(port=2222, host="0.0.0.0"):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind((host, port))
    sock.listen(100)
    print(f"Cowrie SSH Decoy listening on {host}:{port}")

    while True:
        try:
            client_sock, client_addr = sock.accept()
            t = threading.Thread(target=handle_ssh_session, args=(client_sock, client_addr), daemon=True)
            t.start()
        except Exception as e:
            print(f"SSH Honeypot accept loop error: {e}")
            time.sleep(1)

if __name__ == "__main__":
    start_ssh_honeypot(settings.COWRIE_PORT)
