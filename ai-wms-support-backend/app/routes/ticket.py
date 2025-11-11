from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.security import require_roles

router = APIRouter()

class TicketIn(BaseModel):
    text: str

class TicketOut(BaseModel):
    summary: str

@router.post("/summarize", response_model=TicketOut, dependencies=[Depends(require_roles(["operator","support"]))])
def summarize(body: TicketIn):
    txt = body.text.strip()
    if not txt:
        return {"summary": "No content provided."}
    # simple mock summarizer
    preview = (txt[:180] + "...") if len(txt) > 200 else txt
    return {"summary": f"Summary: {preview}"}
