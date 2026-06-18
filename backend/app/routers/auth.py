from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
from ..database import get_db
from ..auth import get_password_hash, verify_password, create_access_token
from ..models import UserRegistration, UserLogin, UserRole
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(profile: UserRegistration):
    db = get_db()
    
    # Check for existing user
    existing_user = await db["users"].find_one({
        "$or": [{"email": profile.email}, {"phone": profile.phone}]
    })
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email or phone already registered"
        )
    
    # Hash password securely
    user_dict = profile.model_dump()
    user_dict["password"] = get_password_hash(profile.password.get_secret_value())
    user_dict.pop("otp", None)
    
    # Initialize profile state
    user_dict.update({
        "is_verified": False,
        "resume_url": None,
        "profile_photo": None,
        "aadhaar_url": None,
        "created_at": None, # Add timestamp for production tracking
    })
    
    result = await db["users"].insert_one(user_dict)
    
    # Initialize role-specific profile data
    if profile.role == UserRole.WORKER:
        await db["worker_profiles"].insert_one({
            "user_id": profile.email,
            "skills": profile.skills,
            "experience_years": 0,
            "availability": True,
            "rating": 0.0,
            "total_reviews": 0
        })
    # Add other role profiles as needed
    
    # Generate immediate login token
    access_token = create_access_token(
        data={"sub": profile.email, "role": profile.role.value}
    )
    
    user_dict.pop("password", None)
    user_dict["_id"] = str(result.inserted_id)
    
    return {
        "message": "User registered successfully",
        "user": user_dict,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login")
async def login(credentials: UserLogin):
    db = get_db()
    user = await db["users"].find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(data={
        "sub": user["email"],
        "role": user.get("role", "professional")
    })
    
    user.pop("password", None)
    user["_id"] = str(user["_id"])
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
