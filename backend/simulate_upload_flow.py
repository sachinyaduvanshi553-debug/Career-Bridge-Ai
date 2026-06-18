import asyncio
import httpx
import os
import secrets
from motor.motor_asyncio import AsyncIOMotorClient

API_URL = "http://localhost:8000/api"
TEST_EMAIL = f"test_{secrets.token_hex(4)}@example.com"
TEST_PASSWORD = "testpassword123"

async def simulate_flow():
    print(f"--- Simulating Flow for {TEST_EMAIL} ---")
    
    async with httpx.AsyncClient() as client:
        # 1. Register
        print("1. Registering...")
        import random
        phone = "".join([str(random.randint(0, 9)) for _ in range(10)])
        reg_data = {
            "name": "Test Worker",
            "email": TEST_EMAIL,
            "phone": phone,
            "location": "Noida",
            "role": "worker",
            "password": TEST_PASSWORD,
            "skills": ["Coding", "Testing"],
            "interests": ["AI"]
        }
        res = await client.post(f"{API_URL}/auth/register", json=reg_data)
        if res.status_code != 200:
            print(f"Error Registering: {res.text}")
            return
        
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("[SUCCESS] Registered and Authenticated")

        # 2. Simulate Resume Upload (Generic Profile Update)
        print("2. Simulating Resume URL update...")
        # Mocking what the frontend does: uploads file -> gets URL -> updates profile
        MOCK_RESUME_URL = "/uploads/chat/test_resume.pdf"
        update_data = {
            "resume_url": MOCK_RESUME_URL,
            "aadhaar_url": "/uploads/chat/test_aadhaar.pdf",
            "bio": "I am a skilled test worker."
        }
        res = await client.post(f"{API_URL}/profile/update", json=update_data, headers=headers)
        if res.status_code != 200:
            print(f"Error Updating Profile: {res.text}")
        else:
            print("[SUCCESS] Profile Updated (Resume/Aadhaar)")

        # 3. Simulate Worker Portfolio Upload
        print("3. Simulating Worker Portfolio Upload...")
        # Actually uploading a tiny dummy file
        with open("dummy.jpg", "wb") as f: f.write(b"dummy image data")
        
        with open("dummy.jpg", "rb") as f:
            res = await client.post(
                f"{API_URL}/worker/upload-work", 
                files={"file": ("test_pic.jpg", f, "image/jpeg")},
                headers=headers
            )
        
        if res.status_code != 200:
            print(f"Error Uploading Pic: {res.text}")
        else:
            print(f"[SUCCESS] Pic Uploaded: {res.json().get('url')}")
            
        # 4. Upload a Video
        with open("dummy.mp4", "wb") as f: f.write(b"dummy video data")
        with open("dummy.mp4", "rb") as f:
            res = await client.post(
                f"{API_URL}/worker/upload-work", 
                files={"file": ("test_vid.mp4", f, "video/mp4")},
                headers=headers
            )
        
        if res.status_code != 200:
            print(f"Error Uploading Vid: {res.text}")
        else:
            print(f"[SUCCESS] Vid Uploaded: {res.json().get('url')}")

        # 5. Simulate Worker Profile Form Update
        print("5. Simulating Worker Profile Form update...")
        worker_form = {
            "specialty": "Full Stack Developer",
            "experience_years": 5,
            "service_charges": 1500.0,
            "description": "Expert in Python/FastAPI and React.",
            "availability": True
        }
        res = await client.post(f"{API_URL}/worker/profile/update", json=worker_form, headers=headers)
        if res.status_code != 200:
            print(f"Error Updating Worker Profile: {res.text}")
        else:
            print("[SUCCESS] Worker Profile Form Updated")

        # 6. Verify via Get Profile
        print("6. Verifying Final Retrieval...")
        res = await client.get(f"{API_URL}/profile", headers=headers)
        if res.status_code != 200:
            print(f"Error Fetching Profile: {res.text}")
            return
            
        profile = res.json()
        print(f"--- Final Document Check (MongoDB Sync) ---")
        print(f"Resume URL in DB: {profile.get('resume_url')}")
        print(f"Aadhaar URL in DB: {profile.get('aadhaar_url')}")
        
        worker_info = profile.get("worker_info", {})
        print(f"Photos Count: {len(worker_info.get('work_photos', []))}")
        print(f"Videos Count: {len(worker_info.get('work_videos', []))}")
        print(f"Specialty: {worker_info.get('specialty')}")
        print(f"Description: {worker_info.get('description')}")
        print(f"Service Charges: {worker_info.get('service_charges')}")
        
        # Cleanup
        if os.path.exists("dummy.jpg"): os.remove("dummy.jpg")
        if os.path.exists("dummy.mp4"): os.remove("dummy.mp4")

if __name__ == "__main__":
    asyncio.run(simulate_flow())
