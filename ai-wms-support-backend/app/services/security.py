from datetime import datetime, timedelta
from typing import List, Optional
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
import os

SECRET = os.getenv("JWT_SECRET", "change-me")
ALGO = "HS256"
ACCESS_MIN = int(os.getenv("JWT_ACCESS_MIN", "60"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Demo users
_USERS = {
    "operator1": {"password": pwd_ctx.hash("op@123"), "roles": ["operator"]},
    "support1":  {"password": pwd_ctx.hash("sup@123"), "roles": ["support","operator"]},
}

def create_token(sub: str, roles: List[str]):
    payload = {
        "sub": sub,
        "roles": roles,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_MIN),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGO)

def decode_token(token: str):
    return jwt.decode(token, SECRET, algorithms=[ALGO])

def require_roles(required: List[str]):
    def dep(token: str = Depends(oauth2_scheme)):
        try:
            claims = decode_token(token)
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        roles = claims.get("roles", [])
        if not any(r in roles for r in required):
            raise HTTPException(status_code=403, detail="Insufficient role")
        return claims
    return dep

def authenticate(username: str, password: str) -> Optional[dict]:
    user = _USERS.get(username)
    if not user: return None
    if not pwd_ctx.verify(password, user["password"]): return None
    return {"username": username, "roles": user["roles"]}
