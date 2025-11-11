from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.security import require_roles

router = APIRouter()

class LpnOut(BaseModel):
    lpn: str
    status: str
    location: str
    last_update: str
    recommendation: str

@router.get("/{lpn_id}", response_model=LpnOut, dependencies=[Depends(require_roles(["operator","support"]))])
def lpn_status(lpn_id: str):
    # Mocked response for demo
    return {
        "lpn": lpn_id,
        "status": "In Picking",
        "location": "Subinventory STAGE / Locator A1-01",
        "last_update": "2025-11-11T10:00:00Z",
        "recommendation": "Confirm reservation; if stuck, run pick release or close task and reassign."
    }
