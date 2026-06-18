from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File
from typing import List, Optional
from ..models import WorkerProfile, UserRole, UserProfile
from ..auth import RoleChecker, get_current_user_email
from ..database import get_db

router = APIRouter(prefix="/api/worker", tags=["Worker"])

# Verification dependency
worker_only = RoleChecker([UserRole.WORKER, UserRole.ADMIN])

@router.post("/verify/aadhaar")
async def verify_aadhaar(aadhaar_number: str = Body(..., embed=True), user: dict = Depends(worker_only)):
    # Simulation logic: 12 digits, simple check
    if len(aadhaar_number) != 12 or not aadhaar_number.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Aadhaar format. Must be 12 digits.")
    
    db = get_db()
    # In a real app, we'd verify with an external service here
    await db["users"].update_one(
        {"email": user["sub"]},
        {"$set": {"is_verified": True, "aadhaar_verified": True}}
    )
    return {"status": "verified", "message": "Aadhaar verified successfully (Simulated)"}

@router.get("/digilocker/docs")
async def get_digilocker_docs(user: dict = Depends(worker_only)):
    # Mock DigiLocker response
    return {
        "source": "DigiLocker",
        "documents": [
            {"type": "Aadhaar Card", "status": "verified", "id": "XXXX-XXXX-1234"},
            {"type": "Driving License", "status": "available", "id": "DL-9087XXX"}
        ]
    }

@router.post("/profile/update")
async def update_worker_profile(
    profile_data: WorkerProfile,
    user: dict = Depends(worker_only)
):
    db = get_db()
    # Upsert worker profile
    await db["worker_profiles"].update_one(
        {"user_id": user["sub"]},
        {"$set": profile_data.model_dump()},
        upsert=True
    )
    return {"message": "Worker profile updated successfully"}

@router.get("/profile")
async def get_worker_profile(user: dict = Depends(worker_only)):
    db = get_db()
    profile = await db["worker_profiles"].find_one({"user_id": user["sub"]})
    if not profile:
        return {"status": "incomplete", "message": "Please set up your worker profile"}
    
    # Calculate real-time stats if needed
    # (In a production app, we might aggregate from completed service_requests)
    completed_jobs = await db["service_requests"].count_documents({
        "worker_id": user["sub"],
        "status": "completed"
    })
    
    profile["_id"] = str(profile["_id"])
    profile["completed_jobs_count"] = completed_jobs
    return profile

@router.get("/requests")
async def get_incoming_requests(user: dict = Depends(worker_only)):
    db = get_db()
    # Filter service requests matched to this worker id or status pending
    requests = await db["service_requests"].find({
        "$or": [
            {"worker_id": user["sub"]},
            {"status": "pending"}
        ]
    }).to_list(length=100)
    
    for r in requests:
        r["_id"] = str(r["_id"])
    return requests
