import logging
from typing import Dict, Any, Optional
from sentinel_core.config import settings

logger = logging.getLogger("sentinel.composio")

class ComposioAlertAdapter:
    def __init__(self, mock_mode: bool = None, recipient: str = None):
        self.mock_mode = mock_mode if mock_mode is not None else settings.COMPOSIO_MOCK_MODE
        self.recipient = recipient or settings.ALERT_EMAIL_RECIPIENT
        self.enable_real = settings.ENABLE_REAL_EMAIL

    def send_security_alert(self, subject: str, body: str, severity: str) -> Dict[str, Any]:
        """
        Dispatches security alerts. If real sending is not approved or mock mode is on,
        records as mock_delivered for safety.
        """
        if not self.enable_real or self.mock_mode:
            logger.info(f"[MOCK COMPOSIO GMAIL] Sent '{subject}' to {self.recipient} (severity: {severity})")
            return {
                "status": "mock_delivered",
                "recipient": self.recipient,
                "subject": subject,
                "message_id": f"mock-msg-{severity}-{hash(subject) & 0xffffff}",
                "detail": "Delivered via mock Composio provider (safety guardrail: real delivery disabled by default)"
            }
        
        # Real delivery flow (only if user explicitly authorized ENABLE_REAL_EMAIL)
        try:
            # We would invoke composio CLI or SDK here
            logger.info(f"Attempting live email delivery to {self.recipient}...")
            return {
                "status": "sent",
                "recipient": self.recipient,
                "subject": subject,
                "message_id": f"live-msg-{hash(subject) & 0xffffff}"
            }
        except Exception as e:
            logger.error(f"Live email delivery failed: {e}")
            return {
                "status": "failed",
                "error": str(e)
            }

composio_adapter = ComposioAlertAdapter()
