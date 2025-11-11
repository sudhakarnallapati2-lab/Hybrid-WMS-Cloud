from fastapi import APIRouter, Query, Depends
from app.services.security import require_roles

router = APIRouter()

@router.get("/top-waits", dependencies=[Depends(require_roles(["support"]))])
def top_waits(hours: int = Query(1, ge=1, le=24)):
    # Mock top waits
    return {"hours": hours, "top_waits": [
        {"event": "db file sequential read", "seconds_waited": 123.4},
        {"event": "log file sync", "seconds_waited": 88.1},
        {"event": "enq: TX - row lock contention", "seconds_waited": 52.0},
    ]}

@router.get("/db-time", dependencies=[Depends(require_roles(["support"]))])
def db_time(hours: int = Query(1, ge=1, le=24)):
    # Mock DB time breakdown
    return {"hours": hours, "db_time": [
        {"stat": "DB time", "seconds": 210.2},
        {"stat": "DB CPU", "seconds": 140.7},
        {"stat": "background cpu time", "seconds": 12.2},
    ]}
