from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File
from typing import List, Optional
import os, shutil, uuid
from ..models import WorkerProfile, UserRole, UserProfile
from ..auth import RoleChecker, get_current_user_email
from ..database import get_db
from ..socket_manager import notify_user, broadcast_worker_update
from ..services.cdn_service import upload_file_to_cdn
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/worker", tags=["Worker"])

# Verification dependency
worker_only = RoleChecker([UserRole.WORKER, UserRole.ADMIN])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "chat")
os.makedirs(UPLOAD_DIR, exist_ok=True)

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
    profile_data: dict = Body(...),
    user: dict = Depends(worker_only)
):
    db = get_db()
    # Filter known worker fields — accept any dict with valid worker keys
    allowed_fields = [
        "skills", "experience_years", "service_charges", "availability",
        "work_photos", "work_videos", "specialty", "description"
    ]
    update_dict = {k: v for k, v in profile_data.items() if k in allowed_fields}
    if update_dict:
        await db["worker_profiles"].update_one(
            {"user_id": user["sub"]},
            {"$set": update_dict},
            upsert=True
        )
    return {"message": "Worker profile updated successfully"}

@router.post("/upload-work")
async def upload_work_file(
    file: UploadFile = File(...),
    user: dict = Depends(worker_only)
):
    """Upload a work portfolio file (image/video/doc) and link to worker profile."""
    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_ext = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm", ".pdf", ".doc", ".docx"}
    if file_ext not in allowed_ext:
        raise HTTPException(status_code=400, detail=f"File type {file_ext} not allowed.")
    
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        # Upload directly to CDN instead of filesystem
        cdn_url = await upload_file_to_cdn(file, folder="worker_portfolio")
        if cdn_url:
            public_url = cdn_url
        else:
            # Fallback local save if CDN fails
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            public_url = f"/uploads/chat/{unique_filename}"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    # Categorize based on extension
    target_field = "work_videos" if file_ext in {".mp4", ".webm"} else "work_photos"
    
    # Push to correct array in DB
    db = get_db()
    await db["worker_profiles"].update_one(
        {"user_id": user["sub"]},
        {"$push": {target_field: public_url}},
        upsert=True
    )
    
    return {"url": public_url, "filename": file.filename, "message": "Uploaded successfully"}

@router.get("/profile")
async def get_worker_profile(user: dict = Depends(worker_only)):
    db = get_db()
    profile = await db["worker_profiles"].find_one({"user_id": user["sub"]})
    if not profile:
        return {"status": "incomplete", "message": "Please set up your worker profile", "work_photos": []}
    
    # Calculate real-time stats if needed
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
@router.post("/requests/{request_id}/update-status")
async def update_request_status(
    request_id: str,
    status: str = Body(..., embed=True),
    user: dict = Depends(worker_only)
):
    """Update status of a service request (Accept, Progress, Complete)."""
    db = get_db()
    
    # 1. Fetch current request
    req_node = await db["service_requests"].find_one({"_id": ObjectId(request_id)})
    if not req_node:
        raise HTTPException(status_code=404, detail="Request not found")
        
    # 2. Update status & worker_id (if accepting)
    update_data: dict = {"status": status}
    if status == "accepted":
        update_data["worker_id"] = user["sub"]
        update_data["accepted_at"] = datetime.utcnow()
    elif status == "completed":
        update_data["completed_at"] = datetime.utcnow()
        # Gamification: Increase Trust Score and Earnings upon Completion
        worker_id = req_node.get("worker_id", user["sub"])
        budget_earned = float(req_node.get("budget", 0))
        await db["worker_profiles"].update_one(
            {"user_id": worker_id},
            {
                "$inc": {
                    "total_earnings": budget_earned,
                    "completed_jobs_count": 1,
                    "trust_points": 50  # 50 Points for Gamification
                },
                "$min": {"rating": 5.0}  # Cap rating if needed
            }
        )
        # Random fractional bump in rating for testing until real reviews are made
        await db["worker_profiles"].update_one(
            {"user_id": worker_id},
            {"$inc": {"rating": 0.1}}
        )
        
    # 3. Commit to DB
    await db["service_requests"].update_one(
        {"_id": ObjectId(request_id)},
        {"$set": update_data}
    )
    
    # 4. Trigger Real-time Event to Customer
    customer_email = req_node.get("customer_id")
    if customer_email:
        await notify_user(customer_email, "request_update", {
            "id": request_id,
            "status": status,
            "worker_id": user["sub"],
            "timestamp": datetime.utcnow().isoformat(),
            "message": f"Your request has been {status}."
        })
        
    # 5. Broadcast to other workers (if accepted, so they can hide it from their list)
    if status == "accepted":
        await broadcast_worker_update("request_claimed", {"id": request_id, "worker_id": user["sub"]})
    
    return {"status": status, "message": f"Work request marked as {status}."}
