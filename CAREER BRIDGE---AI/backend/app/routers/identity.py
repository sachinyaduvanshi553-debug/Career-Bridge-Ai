from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any, Optional
from ..auth import get_current_user_email
from ..database import get_db
from datetime import datetime
import asyncio

router = APIRouter(prefix="/api/identity", tags=["Identity"])

@router.post("/verify")
async def verify_identity(
    document_type: str = Body(..., embed=True),
    document_number: str = Body(..., embed=True),
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Mock DigiLocker Verification Flow.
    In a real app, this would redirect to DigiLocker OAuth or use their API to fetch documents.
    """
    # 1. Simulate process delay (DigiLocker fetching...)
    await asyncio.sleep(1.5)
    
    # 2. Basic validation (Mock logic)
    if document_type == "aadhaar" and len(document_number) != 12:
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number. Must be 12 digits.")
    
    if document_type == "pan" and len(document_number) != 10:
        raise HTTPException(status_code=400, detail="Invalid PAN number. Must be 10 characters.")

    db = get_db()
    
    # 3. Update user status in DB
    result = await db["users"].update_one(
        {"email": current_user_email},
        {
            "$set": {
                "is_verified": True,
                "verification_status": "verified",
                "verified_at": datetime.utcnow(),
                "identity_document_type": document_type,
                "document_last_4": document_number[-4:]
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "status": "success",
        "message": f"Identity verified via DigiLocker using {document_type.upper()}",
        "verification_status": "verified"
    }

@router.get("/status")
async def get_verification_status(current_user_email: str = Depends(get_current_user_email)):
    db = get_db()
    user = await db["users"].find_one({"email": current_user_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "is_verified": user.get("is_verified", False),
        "verification_status": user.get("verification_status", "unverified"),
        "document_type": user.get("identity_document_type"),
        "document_last_4": user.get("document_last_4")
    }
