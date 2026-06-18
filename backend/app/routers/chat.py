from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, UploadFile, File, HTTPException, Query
from typing import Dict, List, Optional
from ..auth import decode_access_token, get_current_user_email
from ..database import get_db
from ..socket_manager import sio, user_sessions
from pydantic import BaseModel
from datetime import datetime
import os
import shutil
import uuid

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatRequestPayload(BaseModel):
    receiver_email: str

class ChatResponsePayload(BaseModel):
    requester_email: str
    status: str

# Ensure upload directory exists
UPLOAD_DIR = "uploads/chat"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ConnectionManager removed. Using Native Socket.io in socket_manager.py

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

@router.get("/connection-status/{target_email}")
async def get_connection_status(target_email: str, current_email: str = Depends(get_current_user_email)):
    db = get_db()
    conn = await db["chat_connections"].find_one({
        "$or": [
            {"user1": current_email, "user2": target_email},
            {"user1": target_email, "user2": current_email}
        ]
    })
    
    if not conn:
        return {"status": "none"}
        
    return {
        "status": conn["status"],
        "requested_by": conn.get("requested_by"),
        "timestamp": conn.get("timestamp")
    }

@router.get("/requests/pending")
async def get_pending_requests(current_email: str = Depends(get_current_user_email)):
    db = get_db()
    # Find requests where the current user is pending receiver
    requests = await db["chat_connections"].find({
        "$or": [
            {"user1": current_email, "requested_by": {"$ne": current_email}, "status": "pending"},
            {"user2": current_email, "requested_by": {"$ne": current_email}, "status": "pending"}
        ]
    }).to_list(length=100)
    
    formatted_requests = []
    for req in requests:
        other_user = req["user1"] if req["user2"] == current_email else req["user2"]
        user_info = await db["users"].find_one({"email": other_user})
        formatted_requests.append({
            "requester_email": other_user,
            "requester_name": user_info.get("name", other_user) if user_info else other_user,
            "status": req["status"]
        })
    return formatted_requests

@router.post("/requests/send")
async def send_chat_request(payload: ChatRequestPayload, current_email: str = Depends(get_current_user_email)):
    db = get_db()
    
    sender_info = user_sessions.get(current_email, {})
    receiver_email = payload.receiver_email
    
    conn = await db["chat_connections"].find_one({
        "$or": [
            {"user1": current_email, "user2": receiver_email},
            {"user1": receiver_email, "user2": current_email}
        ]
    })
    
    if not conn:
        await db["chat_connections"].insert_one({
            "user1": current_email,
            "user2": receiver_email,
            "status": "pending",
            "requested_by": current_email,
            "timestamp": datetime.utcnow()
        })
    elif conn["status"] == "declined":
        await db["chat_connections"].update_one(
            {"_id": conn["_id"]},
            {"$set": {"status": "pending", "requested_by": current_email, "timestamp": datetime.utcnow()}}
        )
    elif conn["status"] == "accepted":
        return {"status": "already_accepted"}
        
    # Notify Receiver via socket if online
    receiver_info = user_sessions.get(receiver_email)
    if receiver_info:
        print(f"Backend Log: Emitting 'chat_request_received' to {receiver_email}")
        # Note: calling await sio.emit works flawlessly from within the event loop
        await sio.emit("chat_request_received", {
            "requester_email": current_email,
            "requester_name": sender_info.get("name", current_email)
        }, room=receiver_info["sid"])

    print(f"Backend Log: Request from {current_email} to {receiver_email} sent successfully")
    return {"status": "success", "message": "Request sent"}

@router.post("/requests/respond")
async def respond_chat_request(payload: ChatResponsePayload, current_email: str = Depends(get_current_user_email)):
    db = get_db()
    
    requester_email = payload.requester_email
    status = payload.status
    
    if status not in ["accepted", "declined"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    conn = await db["chat_connections"].find_one({
        "$or": [
            {"user1": requester_email, "user2": current_email},
            {"user1": current_email, "user2": requester_email}
        ]
    })
    
    if conn and conn["status"] == "pending":
        await db["chat_connections"].update_one(
            {"_id": conn["_id"]},
            {"$set": {"status": status, "timestamp": datetime.utcnow()}}
        )
        
        # Notify requester (A)
        requester_info = user_sessions.get(requester_email)
        if requester_info:
            print(f"Backend Log: Emitting 'chat_request_updated' ({status}) to requester: {requester_email}")
            await sio.emit("chat_request_updated", {
                "receiver_email": current_email,
                "status": status
            }, room=requester_info["sid"])
        
        # Also notify receiver (B, the current user) on their active sockets
        current_user_info = user_sessions.get(current_email)
        if current_user_info:
            print(f"Backend Log: Emitting 'chat_request_updated' ({status}) to receiver: {current_email}")
            await sio.emit("chat_request_updated", {
                "receiver_email": requester_email,
                "status": status
            }, room=current_user_info["sid"])
            
    print(f"Backend Log: Request handled, status: {status}")
    return {"status": "success", "handled_status": status}

@router.get("/history/{receiver_email}")
async def get_chat_history(receiver_email: str, token: str):
    payload = decode_access_token(token)
    if not payload:
        return {"error": "Unauthorized"}
    
    user_email = payload.get("sub")
    db = get_db()
    
    # Fetch messages between sub and receiver_email
    messages = await db["messages"].find({
        "$or": [
            {"sender_id": user_email, "receiver_id": receiver_email},
            {"sender_id": receiver_email, "receiver_id": user_email}
        ]
    }).sort("timestamp", 1).to_list(length=100)
    
    for m in messages:
        m["_id"] = str(m["_id"])
        
    return messages

@router.get("/users")
async def get_chat_users(
    query: Optional[str] = Query(None),
    current_email: str = Depends(get_current_user_email)
):
    """ Returns all users for discovery with optional search. """
    db = get_db()
    filter_query = {"email": {"$ne": current_email}}
    
    if query:
        filter_query["$or"] = [
            {"name": {"$regex": query, "$options": "i"}},
            {"email": {"$regex": query, "$options": "i"}},
            {"role": {"$regex": query, "$options": "i"}}
        ]
        
    users = await db["users"].find(filter_query).to_list(length=100)
    for u in users:
        u["_id"] = str(u["_id"])
        u.pop("password", None)
    return users

@router.get("/conversations")
async def get_conversations(current_email: str = Depends(get_current_user_email)):
    """ Returns a list of users the current user is connected with (Accepted Chats). """
    db = get_db()
    
    # Find connections where current_email is either user1 or user2 AND status is accepted
    connections = await db["chat_connections"].find({
        "$or": [{"user1": current_email}, {"user2": current_email}],
        "status": "accepted"
    }).sort("timestamp", -1).to_list(length=1000)
    
    other_emails = set()
    for conn in connections:
        if conn["user1"] != current_email:
            other_emails.add(conn["user1"])
        if conn["user2"] != current_email:
            other_emails.add(conn["user2"])
            
    if not other_emails:
        return []
        
    users = await db["users"].find({"email": {"$in": list(other_emails)}}).to_list(length=100)
    for u in users:
        u["_id"] = str(u["_id"])
        u.pop("password", None)
    return users
