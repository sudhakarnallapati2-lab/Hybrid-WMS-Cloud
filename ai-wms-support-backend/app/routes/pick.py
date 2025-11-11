from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.security import require_roles

router = APIRouter()

class PickOut(BaseModel):
    delivery: str
    status: str
    issue: str | None = None
    suggestion: str

@router.get("/status/{delivery_id}", response_model=PickOut, dependencies=[Depends(require_roles(["support"]))])
def pick_status(delivery_id: str):
    # Mock evaluation
    if delivery_id.endswith("9"):
        return {"delivery": delivery_id, "status": "Held", "issue": "Backorder on item 12345", "suggestion": "Release after replenishment or split delivery."}
    return {"delivery": delivery_id, "status": "Ready", "issue": None, "suggestion": "Proceed with pick release."}
