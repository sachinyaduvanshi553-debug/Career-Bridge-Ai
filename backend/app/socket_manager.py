import socketio
import logging
import json
from typing import Dict, Any, List
from datetime import datetime
try:
    from .database import get_db
except ImportError:
    from app.database import get_db

logger = logging.getLogger(__name__)

# Create an Async Server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=False
)

# ASGI Application (mount this in main.py)
socket_app = socketio.ASGIApp(sio)

# Mapping of user_email -> {sid, email, name, role, last_seen}
user_sessions: Dict[str, dict] = {}
import asyncio

async def broadcast_active_users():
    # Only send minimal data to speed up processing
    active_users = []
    for email, info in user_sessions.items():
        active_users.append({
            "email": email,
            "name": info.get("name", "Unknown"),
            "role": info.get("role", "member"),
            "status": "online"
        })
    await sio.emit("active_users", active_users)

@sio.event
async def heartbeat(sid, data):
    """
    Update the last_seen timestamp for a user.
    """
    email = data.get("email")
    if email and email in user_sessions:
        user_sessions[email]["last_seen"] = datetime.utcnow()
        # No broadcast here to avoid chatty network, just internal tracking
        # Could occasionally purge dead sessions if needed
        pass

@sio.event
async def get_active_users(sid):
    """
    On-demand fetch active users for a newly connected/mounted client.
    """
    active_users = []
    for email, info in user_sessions.items():
        active_users.append({
            "email": email,
            "name": info.get("name", "Unknown"),
            "role": info.get("role", "member"),
            "status": "online"
        })
    await sio.emit("active_users", active_users, room=sid)

@sio.event
async def connect(sid, environ):
    logger.info(f"Socket connected: {sid}")

@sio.event
async def authenticate(sid, data):
    """
    Authenticate a socket connection with a user email/token.
    { "email": "user@example.com", "name": "...", "role": "..." }
    """
    email = data.get("email")
    if email:
        user_sessions[email] = {
            "sid": sid,
            "email": email,
            "name": data.get("name", "Unknown"),
            "role": data.get("role", "member")
        }
        logger.info(f"User {email} authenticated on socket {sid}")
        await sio.emit("authenticated", {"status": "success"}, room=sid)
        await broadcast_active_users()

@sio.event
async def disconnect(sid):
    # Remove from session mapping
    disconnected_email = None
    for email, info in list(user_sessions.items()):
        if info["sid"] == sid:
            disconnected_email = email
            del user_sessions[email]
            logger.info(f"User {email} disconnected")
            break
    logger.info(f"Socket disconnected: {sid}")
    if disconnected_email:
        await broadcast_active_users()

@sio.event
async def chat_request(sid, data):
    """
    A wants to chat with B.
    data = {"receiver_email": "b@example.com"}
    """
    sender_email = None
    sender_info = None
    for email, info in user_sessions.items():
        if info["sid"] == sid:
            sender_email = email
            sender_info = info
            break
            
    if not sender_email:
        return
        
    receiver_email = data.get("receiver_email")
    if not receiver_email:
        return
        
    # Direct Emit Strategy: Notify receiver immediately before DB confirms (Optimistic)
    receiver_info = user_sessions.get(receiver_email)
    if receiver_info:
        await sio.emit("chat_request_received", {
            "requester_email": sender_email,
            "requester_name": sender_info.get("name", sender_email)
        }, room=receiver_info["sid"])

    # DB write happens in background for speed
    async def save_request():
        db = get_db()
        conn = await db["chat_connections"].find_one({
            "$or": [
                {"user1": sender_email, "user2": receiver_email},
                {"user1": receiver_email, "user2": sender_email}
            ]
        })
        
        if not conn:
            await db["chat_connections"].insert_one({
                "user1": sender_email,
                "user2": receiver_email,
                "status": "pending",
                "requested_by": sender_email,
                "timestamp": datetime.utcnow()
            })
        elif conn["status"] == "declined":
            await db["chat_connections"].update_one(
                {"_id": conn["_id"]},
                {"$set": {"status": "pending", "requested_by": sender_email, "timestamp": datetime.utcnow()}}
            )
            
    asyncio.create_task(save_request())

    # Confirm to sender it is pending
    await sio.emit("chat_request_updated", {
        "receiver_email": receiver_email,
        "status": "pending"
    }, room=sid)

@sio.event
async def chat_request_response(sid, data):
    """
    B responds to A's chat request.
    data = {"requester_email": "a@example.com", "status": "accepted" | "declined"}
    """
    receiver_email = None
    for email, info in user_sessions.items():
        if info["sid"] == sid:
            receiver_email = email
            break
            
    if not receiver_email:
        return
        
    requester_email = data.get("requester_email")
    status = data.get("status")
    
    if not requester_email or status not in ["accepted", "declined"]:
        return
        
    db = get_db()
    conn = await db["chat_connections"].find_one({
        "$or": [
            {"user1": requester_email, "user2": receiver_email},
            {"user1": receiver_email, "user2": requester_email}
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
            await sio.emit("chat_request_updated", {
                "receiver_email": receiver_email,
                "status": status
            }, room=requester_info["sid"])
        
        # Notify receiver (B) that they accepted/declined it successfully
        await sio.emit("chat_request_updated", {
            "receiver_email": requester_email,
            "status": status
        }, room=sid)

@sio.event
async def private_message(sid, data):
    """
    A sends message to B.
    data = {"receiver": "...", "message": "...", "type": "text", "file_url": None, "latitude": None, "longitude": None}
    """
    sender_email = None
    for email, info in user_sessions.items():
        if info["sid"] == sid:
            sender_email = email
            break
            
    if not sender_email:
        return
        
    receiver_email = data.get("receiver")
    if not receiver_email:
        return
        
    db = get_db()
    conn = await db["chat_connections"].find_one({
        "$or": [
            {"user1": sender_email, "user2": receiver_email},
            {"user1": receiver_email, "user2": sender_email}
        ]
    })
    
    if not conn or conn["status"] != "accepted":
        return
        
    msg_payload = {
        "sender": sender_email,
        "receiver": receiver_email,
        "message": data.get("message"),
        "type": data.get("type", "text"),
        "file_url": data.get("file_url"),
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await db["messages"].insert_one({
        "sender_id": sender_email,
        "receiver_id": receiver_email,
        "message": msg_payload["message"],
        "type": msg_payload["type"],
        "file_url": msg_payload["file_url"],
        "latitude": msg_payload["latitude"],
        "longitude": msg_payload["longitude"],
        "timestamp": datetime.utcnow(),
        "is_read": False
    })
    
    receiver_info = user_sessions.get(receiver_email)
    if receiver_info:
        await sio.emit("receive_message", msg_payload, room=receiver_info["sid"])

async def notify_user(email: str, event: str, data: Any):
    info = user_sessions.get(email)
    if info:
        await sio.emit(event, data, room=info["sid"])
        logger.info(f"Notified {email} about {event}")
    else:
        logger.warning(f"Could not notify {email}: No active socket session")

async def broadcast_worker_update(event: str, data: Any):
    await sio.emit(event, data)
