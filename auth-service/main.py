from fastapi import FastAPI, HTTPException, Header, Request, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import jwt
import datetime
import os
import bcrypt
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from models import User

# Not strictly necessary if alembic is used, but safe for cold boot
Base.metadata.create_all(bind=engine)

app = FastAPI()

from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Counter

Instrumentator().instrument(app).expose(app)

AUTH_FAILURES = Counter("auth_failures_total", "Count of 401/403 responses")
SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"

# Login attempt tracking for brute-force protection
login_attempts = {}  # ip -> { count, last_attempt }
MAX_ATTEMPTS = 5
LOCKOUT_SECONDS = 300  # 5 minutes


class LoginRequest(BaseModel):
    username: str
    password: str


def check_rate_limit(client_ip: str) -> bool:
    """Returns True if rate limit exceeded (should block)."""
    now = datetime.datetime.utcnow()
    if client_ip in login_attempts:
        record = login_attempts[client_ip]
        elapsed = (now - record["last_attempt"]).total_seconds()
        if elapsed > LOCKOUT_SECONDS:
            # Lockout expired, reset
            login_attempts[client_ip] = {"count": 0, "last_attempt": now}
            return False
        if record["count"] >= MAX_ATTEMPTS:
            return True
    return False


def record_attempt(client_ip: str, success: bool):
    """Track login attempt for brute-force protection."""
    now = datetime.datetime.utcnow()
    if success:
        login_attempts.pop(client_ip, None)
        return
    if client_ip not in login_attempts:
        login_attempts[client_ip] = {"count": 0, "last_attempt": now}
    login_attempts[client_ip]["count"] += 1
    login_attempts[client_ip]["last_attempt"] = now


@app.post("/login")
def login(request_body: LoginRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"

    # Brute-force protection
    if check_rate_limit(client_ip):
        AUTH_FAILURES.inc()
        raise HTTPException(
            status_code=429,
            detail=f"Too many login attempts. Try again in {LOCKOUT_SECONDS}s.",
        )

    user = db.query(User).filter(User.username == request_body.username).first()
    if not user:
        record_attempt(client_ip, False)
        AUTH_FAILURES.inc()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        AUTH_FAILURES.inc()
        raise HTTPException(status_code=403, detail="User account is disabled")

    # bcrypt password verification
    if not bcrypt.checkpw(
        request_body.password.encode("utf-8"),
        user.password_hash.encode("utf-8"),
    ):
        record_attempt(client_ip, False)
        AUTH_FAILURES.inc()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Success - generate JWT
    record_attempt(client_ip, True)
    payload = {
        "sub": user.username,
        "role": user.role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    # Return token in response body AND set httpOnly cookie
    response = JSONResponse(content={"access_token": token, "token_type": "bearer"})
    response.set_cookie(
        key="rms_token",
        value=token,
        httponly=True,
        secure=False,  # Set True in HTTPS production
        samesite="strict",
        max_age=3600,
        path="/",
    )
    return response


@app.get("/verify")
def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        AUTH_FAILURES.inc()
        raise HTTPException(status_code=401, detail="Missing Token")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            AUTH_FAILURES.inc()
            raise HTTPException(status_code=401, detail="Invalid Scheme")

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"valid": True, "user": payload["sub"], "role": payload.get("role")}
    except Exception:
        AUTH_FAILURES.inc()
        raise HTTPException(status_code=401, detail="Invalid Token")


@app.get("/")
def read_root():
    return {"service": "Auth Service", "status": "active"}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "auth-service"}
