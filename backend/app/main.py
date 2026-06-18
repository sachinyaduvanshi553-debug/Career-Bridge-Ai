from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Body
from fastapi.param_functions import Body as BodyField
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import io
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from dotenv import load_dotenv
import csv
import random
import json
import logging
import sentry_sdk
from datetime import datetime, timedelta
from pypdf import PdfReader

# Initialize Sentry
sentry_dsn = os.getenv("SENTRY_DSN", "")
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )


# Internal Imports - Using relative imports for reliability within the package
try:
    from .skill_extractor import SkillExtractor
    from .skill_gap_analyzer import SkillGapAnalyzer
    from .career_recommender import CareerRecommender
    from .roadmap_generator import RoadmapGenerator
    from .resume_scorer import ResumeScorer
    from .interview_engine import InterviewEngine
    from .analytics_engine import AnalyticsEngine
    from .job_matcher import JobMatcher
    from .services.job_service import JobFetcherService
    from .models import UserProfile, JobRole, ResumeAnalysis, SkillGapReport, JobListing, UserRegistration, UserLogin, SendOTPRequest, UserRole
    from .database import get_db
    from .auth import get_password_hash, verify_password, create_access_token, get_current_user_email, RoleChecker
    from .services.firebase_service import verify_firebase_token
    from .routers import worker, customer, admin, chat, identity, assistant
    from .socket_manager import socket_app
except (ImportError, ValueError):
    # Fallback for direct execution or misconfigured PYTHONPATH
    from app.skill_extractor import SkillExtractor
    from app.skill_gap_analyzer import SkillGapAnalyzer
    from app.career_recommender import CareerRecommender
    from app.roadmap_generator import RoadmapGenerator
    from app.resume_scorer import ResumeScorer
    from app.interview_engine import InterviewEngine
    from app.analytics_engine import AnalyticsEngine
    from app.job_matcher import JobMatcher
    from app.services.job_service import JobFetcherService
    from app.models import UserProfile, JobRole, ResumeAnalysis, SkillGapReport, JobListing, UserRegistration, UserLogin, SendOTPRequest, UserRole
    from app.database import get_db
    from app.auth import get_password_hash, verify_password, create_access_token, get_current_user_email, RoleChecker
    from app.services.firebase_service import verify_firebase_token
    from app.routers import worker, customer, admin, chat, identity, assistant
    from app.socket_manager import socket_app
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# ---- Configuration ----
PORT = int(os.getenv("PORT", 8000))
ALLOWED_ORIGINS_STR = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS: List[str] = (
    ["*"] if ALLOWED_ORIGINS_STR == "*"
    else [o.strip() for o in ALLOWED_ORIGINS_STR.split(",")]
)

app = FastAPI(title="CAREER BRIDGE - AI API")

# Ensure upload directories exist
os.makedirs("uploads/chat", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register Routers
app.include_router(worker.router)
app.include_router(customer.router)
app.include_router(admin.router)
app.include_router(chat.router)
app.include_router(identity.router)
app.include_router(assistant.router)

# Real-time WebSocket Mount (Done at the bottom via wrap instead of mount)

# CORS Configuration
# NOTE: allow_credentials=True is only valid when allow_origins is NOT ["*"].
# When ALLOWED_ORIGINS env var lists specific URLs (e.g. your frontend), credentials work.
# In development (wildcard), credentials are disabled to comply with the CORS spec.
_use_credentials = ALLOWED_ORIGINS != ["*"]

@app.on_event("startup")
async def startup_db_client():
    db = get_db()
    
    # 1. Verify MongoDB connection
    try:
        from .database import client as mongo_client
    except ImportError:
        from app.database import client as mongo_client
    
    try:
        await mongo_client.admin.command("ping")
        logger.info("✅ MongoDB connection: SUCCESS")
    except Exception as e:
        logger.error(f"❌ MongoDB connection FAILED: {e}")
        logger.error("Check MONGO_URL env var on Render dashboard!")
        return  # Stop startup if DB not reachable

    # 2. Log which database we're connected to
    logger.info(f"📦 Using database: '{db.name}'")

    # 3. Explicitly create all required collections (safe if already exist)
    required_collections = [
        "users",
        "worker_profiles",
        "professional_profiles",
        "customer_profiles",
        "service_requests",
        "messages",
        "reviews",
        "chat_connections"
    ]
    existing = await db.list_collection_names()
    for col in required_collections:
        if col not in existing:
            await db.create_collection(col)
            logger.info(f"  📂 Created collection: {col}")
        else:
            logger.info(f"  ✅ Collection exists: {col}")

    # 4. Create indexes (handle duplicate key errors gracefully)
    try:
        await db["users"].create_index("email", unique=True)
        # Fix: Existing index might not be sparse, so we try to create it and catch conflicts
        try:
            await db["users"].create_index("phone", unique=True, sparse=True)
        except Exception as e:
            if "IndexKeySpecsConflict" in str(e):
                logger.info("  ⚠️ Phone index already exists without sparse=True. Skipping update to avoid downtime.")
            else:
                logger.warning(f"  ⚠️ Could not create phone index: {e}")
        
        await db["worker_profiles"].create_index("user_id", unique=True, sparse=True)
        await db["service_requests"].create_index("customer_id")
        await db["service_requests"].create_index("worker_id")
        await db["messages"].create_index([("sender_id", 1), ("receiver_id", 1)])
        await db["messages"].create_index("timestamp")
        logger.info("✅ MongoDB indexes verified/created successfully.")
    except Exception as e:
        logger.warning(f"⚠️ Index creation warning (non-fatal): {e}")


logger.info(f"CORS Configuration: ORIGINS={ALLOWED_ORIGINS}, CREDENTIALS={_use_credentials}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=_use_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
extractor = SkillExtractor()
gap_analyzer = SkillGapAnalyzer()

def load_roles_from_dataset():
    roles = []
    data_path = os.path.join(os.path.dirname(__file__), "../data/skills_roles_dataset.csv")
    try:
        with open(data_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            seen = set()
            for idx, row in enumerate(reader, start=1):
                title = row["Role"]
                if title not in seen:
                    roles.append(JobRole(
                        id=str(idx),
                        title=title,
                        category=row["Category"],
                        requiredSkills=[s.strip() for s in row["Skills"].split(",")],
                        avgSalary=row["AverageSalary"],
                        demandLevel=row["DemandLevel"],
                        growth="High",
                        description=f"Professional {title} role in the {row['Category']} sector."
                    ))
                    seen.add(title)
    except Exception as e:
        logger.warning(f"Could not load roles dataset: {e}")
    return roles if roles else []

# Load authentic roles from the 6500-row dataset
ROLES_DB = load_roles_from_dataset()

career_recommender = CareerRecommender(ROLES_DB)
roadmap_generator = RoadmapGenerator([]) # Internal CSV used
resume_scorer = ResumeScorer(roles_db=ROLES_DB)
interview_engine = InterviewEngine()
analytics_engine = AnalyticsEngine([r.__dict__ for r in ROLES_DB])
job_fetcher = JobFetcherService()

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {"message": "Welcome to CAREER BRIDGE - AI API"}

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "CAREER BRIDGE - AI API"}

# Auth & Profile
@app.post("/api/auth/register")
@app.post("/auth/register")
async def register(profile: UserRegistration):
    db = get_db()
    
    # 1. Assert Phone & Email Uniqueness
    existing_user = await db["users"].find_one({"$or": [{"email": profile.email}, {"phone": profile.phone}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or phone already registered")
    
    # 3. Securely pack and insert model
    user_dict = profile.model_dump()
    # Fix: Ensure we get the raw string from SecretStr for hashing
    user_dict["password"] = get_password_hash(profile.password.get_secret_value())
    user_dict.pop("otp", None)  # Remove OTP from DB payload
    user_dict["is_verified"] = False
    user_dict["aadhaar_url"] = None
    user_dict["resume_url"] = None
    user_dict["profile_photo"] = None
    
    result = await db["users"].insert_one(user_dict)
    
    # NEW: Create role-specific Profile entry
    if profile.role == UserRole.WORKER:
        worker_profile = {
            "user_id": profile.email,
            "skills": profile.skills,
            "experience_years": 0,
            "service_charges": 0.0,
            "rating": 0.0,
            "total_reviews": 0,
            "total_earnings": 0.0,
            "availability": True,
            "work_photos": [],
            "work_videos": []
        }
        await db["worker_profiles"].insert_one(worker_profile)
    elif profile.role == UserRole.PROFESSIONAL:
        prof_profile = {
            "user_id": profile.email,
            "industry": profile.interests[0] if profile.interests else "General",
            "certifications": [],
            "projects": [],
            "mentorship_available": False,
            "years_in_field": 0
        }
        await db["professional_profiles"].insert_one(prof_profile)
    elif profile.role == UserRole.CUSTOMER:
        cust_profile = {
            "user_id": profile.email,
            "preferences": profile.interests,
            "total_spent": 0.0,
            "saved_locations": [profile.location]
        }
        await db["customer_profiles"].insert_one(cust_profile)
    
    # Generate token for immediate login (Production Ready)
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

@app.post("/api/auth/login")
@app.post("/auth/login")
async def login(credentials: UserLogin):
    db = get_db()
    user = await db["users"].find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Include role in JWT payload
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

# Auth & Profile
@app.get("/api/profile")
@app.get("/profile")
async def get_profile(email: str = Depends(get_current_user_email)):
    db = get_db()
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 1. Pop sensitive fields
    user.pop("password", None)
    user["_id"] = str(user["_id"])
    
    # 2. Aggregating Role-Specific Extra-data
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

@app.post("/api/profile/update")
@app.post("/profile/update")
async def update_profile(
    data: dict = BodyField(...),
    email: str = Depends(get_current_user_email)
):
    db = get_db()
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    role = user.get("role")
    
    # Update main user doc
    main_fields = [
        "name", "phone", "location", "bio", "skills", "interests", "education",
        "profile_photo", "resume_url", "aadhaar_url",
        # Social links
        "linkedin", "github", "portfolio_url",
        # Professional info
        "current_job_title", "industry", "experience_years",
        # Specialty for workers (shared doc update)
        "specialty", "description"
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
        prof_fields = [
            "mentorship_available", 
            "professional_projects", 
            "education_history", 
            "certifications_list"
        ]
        p_update = {k: v for k, v in data.items() if k in prof_fields}
        if p_update:
            await db["professional_profiles"].update_one({"user_id": email}, {"$set": p_update}, upsert=True)
    elif role == UserRole.CUSTOMER:
        cust_fields = ["preferences", "saved_locations", "preferred_language"]
        c_update = {k: v for k, v in data.items() if k in cust_fields}
        if c_update:
            await db["customer_profiles"].update_one({"user_id": email}, {"$set": c_update}, upsert=True)
            
    return {"message": "Profile updated successfully"}

# Core Features
# (Imports moved to top)

@app.post("/api/resume/analyze")
@app.post("/resume/analyze")
async def analyze_resume(target_role: Optional[str] = None, file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename.lower()
    
    text = ""
    if filename.endswith(".pdf"):
        try:
            pdf_reader = PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not parse PDF: {str(e)}")
    else:
        # Assume text/plain or similar
        text = content.decode("utf-8", errors="ignore")  # type: ignore
        
    if not text.strip():
        raise HTTPException(status_code=400, detail="Uploaded file is empty or unreadable.")
        
    logger.info(f"Analyzing resume: {filename}")
    try:
        analysis = await resume_scorer.score_resume(text, target_role=target_role)
        logger.info(f"Analysis completed successfully for {filename}")
        return analysis
    except Exception as e:
        logger.error(f"Error during resume analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/skills/gap")
@app.post("/skills/gap")
async def analyze_skill_gap(data: Dict[str, Any]):
    user_skills = data.get("user_skills", [])
    target_role_id = data.get("role_id")
    
    role = next((r for r in ROLES_DB if r.id == target_role_id), ROLES_DB[0] if ROLES_DB else None)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    report = await gap_analyzer.analyze_gap(user_skills, role.requiredSkills)
    return report

@app.get("/api/career/recommend")
@app.get("/career/recommend")
async def recommend_careers(skills: str):
    skill_list = skills.split(",")
    return await career_recommender.recommend(skill_list)

@app.get("/api/roadmap/{role_id}")
@app.get("/roadmap/{role_id}")
async def get_roadmap(role_id: str):
    role = next((r for r in ROLES_DB if r.id == role_id), ROLES_DB[0] if ROLES_DB else None)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    # For demo, assuming these are missing skills
    return await roadmap_generator.generate(role.requiredSkills, target_role=role.title)

from fastapi import Response

@app.get("/api/jobs", response_model=List[JobListing])
@app.get("/jobs", response_model=List[JobListing])
async def get_jobs(response: Response, skills: str = "Python", location: Optional[str] = None):
    # Add Edge Caching headers
    response.headers["Cache-Control"] = "public, max-age=120, stale-while-revalidate=60"
    """
    Fetch jobs matching the user's skills and location.
    Combines live jobs from Adzuna API with high-quality local results.
    """
    try:
        skill_list = [s.strip() for s in skills.split(",")]
        
        # 1. Fetch live jobs from Adzuna (async)
        live_jobs = await job_fetcher.fetch_live_jobs(skills, location)
        
        # 2. Match against combined set (semantic ranking)
        matcher = JobMatcher([r.__dict__ for r in ROLES_DB])
        results = await matcher.match(skill_list, location, live_jobs)
        
        return results[:30] # Return top 30 matches
    except Exception as e:
        logger.error(f"Error in get_jobs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch jobs. Please try again later.")

@app.post("/api/interview/start")
@app.post("/interview/start")
async def start_interview(data: Dict[str, str]):
    role_id = data.get("role_id")
    role = next((r for r in ROLES_DB if r.id == role_id), ROLES_DB[0] if ROLES_DB else None)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return await interview_engine.get_questions(role.title)

@app.post("/api/interview/evaluate")
@app.post("/interview/evaluate")
async def evaluate_answer(data: Dict[str, str]):
    return await interview_engine.evaluate_answer(data.get("question", ""), data.get("answer", ""))

@app.get("/api/analytics/overview")
@app.get("/analytics/overview")
async def get_analytics_overview():
    return analytics_engine.get_overview()

@app.get("/api/analytics/districts")
@app.get("/analytics/districts")
async def get_district_analytics(state: Optional[str] = None):
    return analytics_engine.get_district_stats(state)

@app.post("/api/cover-letter/generate")
@app.post("/cover-letter/generate")
async def generate_cover_letter(data: Dict[str, Any], email: str = Depends(get_current_user_email)):
    db = get_db()
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    target_role = data.get("target_role", "Software Engineer")
    job_description = data.get("job_description", "")
    
    try:
        from .services.gemini_service import gemini_service
    except:
        from app.services.gemini_service import gemini_service
        
    prompt = f"""
    Write a highly professional, modern 250-word cover letter for the role of {target_role}.
    
    Candidate details:
    - Name: {user.get('name', 'Candidate')}
    - Skills: {', '.join(user.get('skills', []))}
    - Bio: {user.get('bio', 'An enthusiastic professional.')}
    
    Job Description context (if any):
    {job_description}
    
    Return only the clean text of the cover letter nicely formatted. Start immediately with 'Dear Hiring Manager,' or similar. Do not explain your response.
    """
    
    ai_response = await gemini_service.generate_ai_response(prompt)
    if not ai_response:
        ai_response = "Dear Hiring Manager, \n\nI am very interested in this role and believe my skills make me a strong candidate. [Default Fallback]"
        
    return {"cover_letter": ai_response}

# Wrap FastAPI app with SocketIO ASGI App to properly handle websockets without Starlette mount routing errors
import socketio
try:
    from .socket_manager import sio
except ImportError:
    from app.socket_manager import sio

app = socketio.ASGIApp(socketio_server=sio, other_asgi_app=app, socketio_path="/ws/socket.io")

if __name__ == "__main__":
    # Production configuration: Run with host 0.0.0.0 for public access, reload=False for performance
    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT, reload=False, workers=1)
