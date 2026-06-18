from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, UploadFile, File, HTTPException
from typing import Dict, List, Optional
from ..auth import decode_access_token, get_current_user_email
from ..database import get_db
from datetime import datetime
import os
import shutil
import uuid

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# Ensure upload directory exists
UPLOAD_DIR = "uploads/chat"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_email: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_email] = websocket

    def disconnect(self, user_email: str):
        if user_email in self.active_connections:
            del self.active_connections[user_email]

    async def send_personal_message(self, message: dict, receiver_email: str):
        if receiver_email in self.active_connections:
            await self.active_connections[receiver_email].send_json(message)

manager = ConnectionManager()

@router.post("/upload")
async def upload_chat_media(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user_email)
):
    """
    Uploads a chat media file (image/video) and returns the public URL.
    """
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the public URL
        # Assuming the backend is served on localhost:8000
        return {"url": f"/uploads/chat/{unique_filename}", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=1008)
        return
    
    user_email = payload.get("sub")
    await manager.connect(user_email, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            # data format: {"receiver": "email", "message": "text", "type": "text", "file_url": "url", "latitude": lat, "longitude": lng}
            receiver_email = data.get("receiver")
            message_text = data.get("message")
            msg_type = data.get("type", "text")
            file_url = data.get("file_url")
            lat = data.get("latitude")
            lng = data.get("longitude")
            
            if receiver_email:
                msg_payload = {
                    "sender": user_email,
                    "message": message_text,
                    "type": msg_type,
                    "file_url": file_url,
                    "latitude": lat,
                    "longitude": lng,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                # 1. Save to DB
                db = get_db()
                await db["chats"].insert_one({
                    "sender_id": user_email,
                    "receiver_id": receiver_email,
                    "message": message_text,
                    "type": msg_type,
                    "file_url": file_url,
                    "latitude": lat,
                    "longitude": lng,
                    "timestamp": datetime.utcnow(),
                    "is_read": False
                })
                
                # 2. Forward to receiver if online
                await manager.send_personal_message(msg_payload, receiver_email)
                
    except WebSocketDisconnect:
        manager.disconnect(user_email)

@router.get("/history/{receiver_email}")
async def get_chat_history(receiver_email: str, token: str):
    payload = decode_access_token(token)
    if not payload:
        return {"error": "Unauthorized"}
    
    user_email = payload.get("sub")
    db = get_db()
    
    # Fetch messages between sub and receiver_email
    messages = await db["chats"].find({
        "$or": [
            {"sender_id": user_email, "receiver_id": receiver_email},
            {"sender_id": receiver_email, "receiver_id": user_email}
        ]
    }).sort("timestamp", 1).to_list(length=100)
    
    for m in messages:
        m["_id"] = str(m["_id"])
        
    return messages

@router.get("/users")
async def get_chat_users(current_email: str = Depends(get_current_user_email)):
    """ Returns all users for discovery. """
    db = get_db()
    users = await db["users"].find({"email": {"$ne": current_email}}).to_list(length=100)
    for u in users:
        u["_id"] = str(u["_id"])
        u.pop("password", None)
    return users

@router.get("/conversations")
async def get_conversations(current_email: str = Depends(get_current_user_email)):
    """ Returns a list of users the current user has chatted with. """
    db = get_db()
    # Find unique receiver_ids where sender is current_email OR unique sender_ids where receiver is current_email
    chats = await db["chats"].find({
        "$or": [{"sender_id": current_email}, {"receiver_id": current_email}]
    }).sort("timestamp", -1).to_list(length=1000)
    
    other_emails = set()
    for c in chats:
        if c["sender_id"] != current_email:
            other_emails.add(c["sender_id"])
        if c["receiver_id"] != current_email:
            other_emails.add(c["receiver_id"])
            
    if not other_emails:
        return []
        
    users = await db["users"].find({"email": {"$in": list(other_emails)}}).to_list(length=100)
    for u in users:
        u["_id"] = str(u["_id"])
        u.pop("password", None)
    return users
