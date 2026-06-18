from pydantic import BaseModel, Field, EmailStr, SecretStr
from typing import List, Optional
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    PROFESSIONAL = "professional"
    WORKER = "worker"
    CUSTOMER = "customer"
    ADMIN = "admin"

class UserProfile(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15) # Basic length check
    location: str
    education: Optional[str] = None
    skills: List[str] = []
    interests: List[str] = []
    bio: Optional[str] = None
    profile_photo: Optional[str] = None
    resume_url: Optional[str] = None
    aadhaar_url: Optional[str] = None
    role: UserRole = UserRole.PROFESSIONAL
    is_verified: bool = False
    aadhaar_verified: bool = False
    verification_status: str = "unverified" # unverified, pending, verified
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    balance: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserRegistration(UserProfile):
    password: SecretStr
    otp: Optional[str] = None

class SendOTPRequest(BaseModel):
    phone: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class JobRole(BaseModel):
    id: str
    title: str
    category: str
    requiredSkills: List[str]
    avgSalary: str
    demandLevel: str
    growth: str
    description: str

class ResumeAnalysis(BaseModel):
    overall_score: int
    keyword_match: int
    extracted_skills: List[str]
    missing_keywords: List[str]
    suggestions: List[str]
    strengths: List[str]

class SkillGapReport(BaseModel):
    matching_skills: List[str]
    missing_skills: List[str]
    readiness_score: float
    status: str

class JobListing(BaseModel):
    id: str
    title: str
    company: str
    location: str
    state: str
    skills: List[str]
    posted: str
    applicants: int
    type: str
    salary: str
    description: str
    redirect_url: Optional[str] = None
    match_score: Optional[float] = None

# --- New Models for Multi-Role Platform ---

class WorkerProfile(BaseModel):
    user_id: Optional[str] = None
    aadhaar_number: Optional[str] = None
    skills: List[str] = []
    experience_years: int = 0
    work_photos: List[str] = []
    work_videos: List[str] = []
    service_charges: float = 0.0
    rating: float = 0.0
    total_reviews: int = 0
    total_earnings: float = 0.0
    availability: bool = True

class ProfessionalProfile(BaseModel):
    user_id: Optional[str] = None
    current_job_title: Optional[str] = None
    industry: Optional[str] = None
    certifications: List[str] = []
    mentorship_available: bool = False
    years_in_field: int = 0
    projects: List[str] = []

class CustomerProfile(BaseModel):
    user_id: Optional[str] = None
    preferences: List[str] = []
    total_spent: float = 0.0
    saved_locations: List[str] = []
    preferred_language: str = "Hindi"

class ServiceRequest(BaseModel):
    id: Optional[str] = None
    customer_id: Optional[str] = None
    worker_id: Optional[str] = None
    work_type: str
    description: str
    budget: float
    location: str
    status: str = "pending" # pending, accepted, completed, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    sender_id: str
    receiver_id: str
    message: Optional[str] = None
    type: str = "text" # text, image, video, location
    file_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = False

class Review(BaseModel):
    worker_id: str
    customer_id: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
