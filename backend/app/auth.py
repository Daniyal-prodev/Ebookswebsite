import os
import hmac
import hashlib
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "aribdaniyal88@gmail.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "daniyaldanish88")
ADMIN_SECRET = os.getenv("ADMIN_SECRET", ADMIN_PASSWORD)

security = HTTPBearer()

def _sign(payload: str) -> str:
    return hmac.new(ADMIN_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()

def authenticate(email: str, password: str) -> str:
    if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:
        payload = email
        sig = _sign(payload)
        return f"{payload}.{sig}"
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

def _verify(token: str) -> bool:
    try:
        payload, sig = token.rsplit(".", 1)
    except ValueError:
        return False
    expected = _sign(payload)
    return hmac.compare_digest(sig, expected) and payload == ADMIN_EMAIL

def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if _verify(token):
        return True
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
