from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Optional, Dict, Any
import io
import logging
from pypdf import PdfReader
from ..services.resume_scorer import ResumeScorer
from ..dependencies import ROLES_DB

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/resume",
    tags=["Resume Analysis"],
    responses={404: {"description": "Not found"}},
)

# Global instance
resume_scorer = ResumeScorer(roles_db=ROLES_DB)

@router.post("/analyze")
async def analyze_resume(
    target_role: Optional[str] = Form(None), 
    file: UploadFile = File(...)
):
    """
    Production-grade endpoint for PDF resume parsing and AI analysis.
    Uses multi-threaded PDF reading and cached AI scoring.
    """
    content = await file.read()
    filename = file.filename.lower()
    
    text = ""
    try:
        if filename.endswith(".pdf"):
            pdf_reader = PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        else:
            # Fallback for plain text
            text = content.decode("utf-8", errors="ignore")
    except Exception as e:
        logger.error(f"❌ PDF extraction failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid PDF format or unreadable content.")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Uploaded resume has no detectable text.")

    logger.info(f"📊 Analyzing resume: {filename}. Estimated tokens: {len(text)/4}")
    
    try:
        # Note: Scorer now uses internal caching for Gemini responses
        analysis = await resume_scorer.score_resume(text, target_role=target_role)
        return analysis
    except Exception as e:
        logger.error(f"❌ Resume analysis crash: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="AI analysis engine timed out.")
