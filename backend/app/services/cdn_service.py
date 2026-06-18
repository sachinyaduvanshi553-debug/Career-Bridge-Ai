import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
import logging

logger = logging.getLogger(__name__)

# Try to initialize Cloudinary
try:
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "demo"),
        api_key=os.getenv("CLOUDINARY_API_KEY", "demo"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET", "demo")
    )
except Exception as e:
    logger.warning(f"Failed to configure Cloudinary: {e}")

async def upload_file_to_cdn(file: UploadFile, folder: str = "career-setu") -> str:
    """Uploads a file to CDN and returns the secure URL."""
    try:
        content = await file.read()
        
        # Determine resource type
        resource_type = "auto"
        if file.content_type == "application/pdf":
            resource_type = "raw"
            
        result = cloudinary.uploader.upload(
            content, 
            folder=folder,
            resource_type=resource_type
        )
        return result.get("secure_url")
    except Exception as e:
        logger.error(f"CDN upload failed: {e}")
        # Return none if upload fails, could fallback to local if needed
        return None
    finally:
        await file.seek(0)
