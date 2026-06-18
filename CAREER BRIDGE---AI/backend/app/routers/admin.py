from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from ..models import UserRole, UserProfile
from ..auth import RoleChecker
from ..database import get_db

router = APIRouter(prefix="/api/admin", tags=["Admin"])

admin_only = RoleChecker([UserRole.ADMIN])

@router.get("/users")
async def monitor_users(user: dict = Depends(admin_only)):
    db = get_db()
    users = await db["users"].find({}).to_list(length=1000)
    for u in users:
        u["_id"] = str(u["_id"])
        u.pop("password", None)
    return users

@router.post("/verify/{email}")
async def verify_user(email: str, status: bool, admin: dict = Depends(admin_only)):
    db = get_db()
    await db["users"].update_one(
        {"email": email},
        {"$set": {"is_verified": status}}
    )
    return {"message": f"User {email} verification status set to {status}"}

@router.get("/stats")
async def get_system_stats(user: dict = Depends(admin_only)):
    db = get_db()
    total_users = await db["users"].count_documents({})
    active_requests = await db["service_requests"].count_documents({"status": "pending"})
    completed_jobs = await db["service_requests"].count_documents({"status": "completed"})
    
    # Revenue insight (sum of budget for completed jobs)
    revenue_cursor = db["service_requests"].aggregate([
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$budget"}}}
    ])
    revenue_data = await revenue_cursor.to_list(length=1)
    revenue = revenue_data[0]["total"] if revenue_data else 0.0
    
    return {
        "total_users": total_users,
        "active_requests": active_requests,
        "completed_jobs": completed_jobs,
        "revenue": revenue
    }

@router.get("/pending-verifications")
async def get_pending_verifications(user: dict = Depends(admin_only)):
    db = get_db()
    # Find workers who are not yet verified
    pending = await db["users"].find({"role": "worker", "is_verified": False}).to_list(length=100)
    for p in pending:
        p["_id"] = str(p["_id"])
        p.pop("password", None)
    return pending
