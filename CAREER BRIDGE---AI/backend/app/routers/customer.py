from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from ..models import ServiceRequest, UserRole, UserProfile, WorkerProfile
from ..auth import RoleChecker, get_current_user_email
from ..database import get_db
from ..services.matching_engine import MatchingEngine

router = APIRouter(prefix="/api/customer", tags=["Customer"])

customer_only = RoleChecker([UserRole.CUSTOMER, UserRole.ADMIN])
matching_engine = MatchingEngine()

@router.get("/services")
async def discover_services(query: str = Query(None)):
    db = get_db()
    # Basic logic: Find workers matching query or just all verified workers
    filter_query = {"availability": True}
    if query:
        filter_query["skills"] = {"$in": [query]}
    
    cursor = db["worker_profiles"].find(filter_query)
    workers = await cursor.to_list(length=100)
    
    detailed_workers = []
    for w in workers:
        user = await db["users"].find_one({"email": w["user_id"]})
        if user:
            detailed_workers.append({
                "worker_id": w["user_id"],
                "name": user["name"],
                "skills": w["skills"],
                "location": user["location"],
                "rating": w["rating"],
                "charges": w["service_charges"]
            })
    return detailed_workers

@router.post("/request")
async def create_service_request(
    request_data: ServiceRequest, 
    user: dict = Depends(customer_only)
):
    db = get_db()
    request_dict = request_data.model_dump()
    request_dict["customer_id"] = user["sub"]
    request_dict["status"] = "pending"
    
    result = await db["service_requests"].insert_one(request_dict)
    request_dict["id"] = str(result.inserted_id)
    
    # 2. Automatically find matches using AI
    matches = await matching_engine.find_matches(request_data)
    
    return {
        "message": "Request created successfully",
        "request": request_dict,
        "suggested_workers": matches
    }

@router.get("/stats")
async def get_customer_stats(user: dict = Depends(customer_only)):
    db = get_db()
    # Count requests by status
    pending = await db["service_requests"].count_documents({"customer_id": user["sub"], "status": "pending"})
    completed = await db["service_requests"].count_documents({"customer_id": user["sub"], "status": "completed"})
    
    # Get user profile for balance
    user_doc = await db["users"].find_one({"email": user["sub"]})
    
    return {
        "pending_requests": pending,
        "completed_requests": completed,
        "balance": user_doc.get("balance", 0.0) if user_doc else 0.0
    }

@router.get("/my-requests")
async def get_user_requests(user: dict = Depends(customer_only)):
    db = get_db()
    requests = await db["service_requests"].find({"customer_id": user["sub"]}).to_list(length=100)
    for r in requests:
        r["_id"] = str(r["_id"])
    return requests
