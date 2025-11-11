from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="AI WMS Support API", version="1.0.0")

# CORS: allow local dev UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev; lock down in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# simple header API key guard (skips for docs/health/auth)
API_KEY = os.getenv("API_KEY_HEADER", "")

@app.middleware("http")
async def header_guard(request: Request, call_next):
    open_paths = {"/", "/docs", "/openapi.json", "/auth/login"}
    if request.url.path in open_paths:
        return await call_next(request)
    x_key = request.headers.get("x-api-key")
    if API_KEY and x_key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return await call_next(request)

from app.routes import lpn, pick, ticket, awr, auth

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(lpn.router, prefix="/lpn", tags=["LPN"])
app.include_router(pick.router, prefix="/pick", tags=["Pick"])
app.include_router(awr.router, prefix="/monitor/awr", tags=["AWR"])
app.include_router(ticket.router, prefix="/ticket", tags=["Ticket"])

@app.get("/")
def health():
    return {"status":"running","service":"AI-WMS"}
