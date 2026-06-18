from fastapi import APIRouter, HTTPException, Depends, status, Body
from typing import Dict, Any, List, Optional
from ..database import get_db
from ..auth import get_current_user_email
from ..models import UserRole
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/profile",
    tags=["User Profile"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_profile(email: str = Depends(get_current_user_email)):
    db = get_db()
    user = await db["users"].find_one({"email": email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.pop("password", None)
    user["_id"] = str(user["_id"])
    
    # Aggregate role-specific info
    role = user.get("role")
    
    if role == UserRole.WORKER:
        worker_data = await db["worker_profiles"].find_one({"user_id": email})
        if worker_data:
            worker_data.pop("_id", None)
            user["worker_info"] = worker_data
    elif role == UserRole.PROFESSIONAL:
        prof_data = await db["professional_profiles"].find_one({"user_id": email})
        if prof_data:
            prof_data.pop("_id", None)
            user["professional_info"] = prof_data
    elif role == UserRole.CUSTOMER:
        cust_data = await db["customer_profiles"].find_one({"user_id": email})
        if cust_data:
            cust_data.pop("_id", None)
            user["customer_info"] = cust_data
            
    return user

@router.post("/update")
async def update_profile(
    data: dict = Body(...),
    email: str = Depends(get_current_user_email)
):
    db = get_db()
    user = await db["users"].find_one({"email": email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    role = user.get("role")
    
    # Defined fields allowed for update
    main_fields = [
        "name", "phone", "location", "bio", "skills", "interests", "education",
        "profile_photo", "resume_url", "aadhaar_url",
        "linkedin", "github", "portfolio_url",
        "current_job_title", "industry", "experience_years"
    ]
    
    update_dict = {k: v for k, v in data.items() if k in main_fields}
    if update_dict:
        await db["users"].update_one({"email": email}, {"$set": update_dict})
        
    # Update role-specific doc
    if role == UserRole.WORKER:
        worker_fields = ["skills", "experience_years", "service_charges", "availability", "work_photos", "work_videos"]
        w_update = {k: v for k, v in data.items() if k in worker_fields}
        if w_update:
            await db["worker_profiles"].update_one({"user_id": email}, {"$set": w_update}, upsert=True)
    elif role == UserRole.PROFESSIONAL:
        prof_fields = ["mentorship_available", "professional_projects", "education_history", "certifications_list"]
        p_update = {k: v for k, v in data.items() if k in prof_fields}
        if p_update:
            await db["professional_profiles"].update_one({"user_id": email}, {"$set": p_update}, upsert=True)
    elif role == UserRole.CUSTOMER:
        cust_fields = ["preferences", "saved_locations", "preferred_language"]
        c_update = {k: v for k, v in data.items() if k in cust_fields}
        if c_update:
            await db["customer_profiles"].update_one({"user_id": email}, {"$set": c_update}, upsert=True)
            
    return {"message": "Profile updated successfully"}
