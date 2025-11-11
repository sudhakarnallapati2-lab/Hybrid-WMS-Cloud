from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.services.security import authenticate, create_token, require_roles

router = APIRouter()

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    user = authenticate(form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Bad credentials")
    token = create_token(user["username"], user["roles"])
    return {"access_token": token, "token_type": "bearer"}

@router.get("/whoami", dependencies=[Depends(require_roles(["operator","support"]))])
def whoami(claims=Depends(require_roles(["operator","support"]))):
    return {"user": claims["sub"], "roles": claims.get("roles", [])}
