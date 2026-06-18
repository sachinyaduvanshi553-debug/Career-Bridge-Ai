from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from ..models import ServiceRequest, UserRole
from ..auth import RoleChecker, get_current_user_email
from ..database import get_db
from ..services.matching_engine import MatchingEngine

router = APIRouter(prefix="/api/customer", tags=["Customer"])

customer_only = RoleChecker([UserRole.CUSTOMER, UserRole.ADMIN])
matching_engine = MatchingEngine()

@router.get("/services")
async def discover_services(query: str = Query(None)):
    db = get_db()
    # Find workers — no strict filter so we always return results even without availability flag
    filter_query = {}
    if query:
        filter_query["$or"] = [
            {"skills": {"$elemMatch": {"$regex": query, "$options": "i"}}},
            {"specialty": {"$regex": query, "$options": "i"}},
        ]
    
    cursor = db["worker_profiles"].find(filter_query)
    workers = await cursor.to_list(length=100)
    
    detailed_workers = []
    for w in workers:
        user_id = w.get("user_id")
        if not user_id or not isinstance(user_id, str):
            continue
        user_doc = await db["users"].find_one({"email": user_id})
        if user_doc:
            detailed_workers.append({
                "worker_id": user_id,
                "name": user_doc.get("name", "Unknown"),
                "skills": w.get("skills", []),
                "location": user_doc.get("location", ""),
                "rating": w.get("rating", 0.0),
                "charges": w.get("service_charges", 0.0),
                "work_photos": w.get("work_photos", [])
            })
    return detailed_workers

@router.post("/request")
async def create_service_request(
    request_data: dict,
    user: dict = Depends(customer_only)
):
    db = get_db()
    
    # Validate required fields
    required = ["work_type", "description", "budget", "location"]
    for field in required:
        if not request_data.get(field):
            raise HTTPException(status_code=422, detail=f"'{field}' is required.")
    
    # Build a clean request document
    request_doc = {
        "customer_id": user["sub"],
        "worker_id": None,
        "work_type": str(request_data["work_type"]),
        "description": str(request_data["description"]),
        "budget": float(request_data["budget"]),
        "location": str(request_data["location"]),
        "status": "pending",
    }
    
    result = await db["service_requests"].insert_one(request_doc)
    request_doc["_id"] = str(result.inserted_id)
    request_doc["id"] = str(result.inserted_id)
    
    # Try to find AI-matched workers (non-blocking if it fails)
    suggested_workers = []
    try:
        # Create a ServiceRequest-like object for the matching engine
        class ReqProxy:
            work_type = request_doc["work_type"]
            description = request_doc["description"]
            location = request_doc["location"]
        suggested_workers = await matching_engine.find_matches(ReqProxy())
    except Exception as e:
        print(f"Matching engine warning: {e}")

    return {
        "message": "Request created successfully",
        "request": request_doc,
        "suggested_workers": suggested_workers
    }

@router.get("/stats")
async def get_customer_stats(user: dict = Depends(customer_only)):
    db = get_db()
    pending = await db["service_requests"].count_documents({"customer_id": user["sub"], "status": "pending"})
    completed = await db["service_requests"].count_documents({"customer_id": user["sub"], "status": "completed"})
    user_doc = await db["users"].find_one({"email": user["sub"]})
    
    return {
        "pending_requests": pending,
        "completed_requests": completed,
        "balance": user_doc.get("balance", 0.0) if user_doc else 0.0
    }

@router.get("/my-requests")
async def get_user_requests(user: dict = Depends(customer_only)):
    db = get_db()
    requests = await db["service_requests"].find(
        {"customer_id": user["sub"]}
    ).sort("_id", -1).to_list(length=100)
    
    for r in requests:
        r["_id"] = str(r["_id"])
        if "id" not in r:
            r["id"] = r["_id"]
    return requests
