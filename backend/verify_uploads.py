import asyncio
import httpx
import os
import secrets
from io import BytesIO

API_URL = "http://localhost:8000/api"
TEST_EMAIL = f"uploader_{secrets.token_hex(4)}@example.com"
TEST_PASSWORD = "password123"

async def test_upload_flow():
    print(f"--- TESTING REAL UPLOAD FLOW FOR {TEST_EMAIL} ---")
    
    async with httpx.AsyncClient() as client:
        # 1. Register & Login
        reg_data = {
            "name": "Uploader Test",
            "email": TEST_EMAIL,
            "phone": "".join([str(secrets.randbelow(10)) for _ in range(10)]),
            "location": "Remote",
            "role": "worker",
            "password": TEST_PASSWORD
        }
        res = await client.post(f"{API_URL}/auth/register", json=reg_data)
        if res.status_code != 200:
            print(f"Registration Error: {res.text}")
            return
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("[SUCCESS] Logged in")

        # 2. Test Profile Photo Upload (via /api/chat/upload)
        print("2. Uploading profile photo...")
        mock_file = BytesIO(b"dummy image data")
        files = {"file": ("test_photo.jpg", mock_file, "image/jpeg")}
        res = await client.post(f"{API_URL}/chat/upload", files=files, headers=headers)
        if res.status_code != 200:
            print(f"[FAIL] /api/chat/upload failed: {res.text}")
        else:
            photo_url = res.json()["url"]
            print(f"[SUCCESS] Uploaded photo: {photo_url}")
            
            # Update user profile with this photo
            print("Updating user profile with photo_url...")
            res = await client.post(f"{API_URL}/profile/update", json={"profile_photo": photo_url}, headers=headers)
            print(f"Profile update result: {res.status_code}")

        # 3. Test Worker Portfolio Upload (via /api/worker/upload-work)
        print("3. Uploading worker portfolio item...")
        mock_video = BytesIO(b"dummy video data")
        files = {"file": ("demo_video.mp4", mock_video, "video/mp4")}
        res = await client.post(f"{API_URL}/worker/upload-work", files=files, headers=headers)
        if res.status_code != 200:
            print(f"[FAIL] /api/worker/upload-work failed: {res.text}")
        else:
            work_url = res.json()["url"]
            print(f"[SUCCESS] Uploaded work item: {work_url}")

        # 4. Verify DB storage
        print("4. Verifying DB Retrieval...")
        res = await client.get(f"{API_URL}/profile", headers=headers)
        profile = res.json()
        print(f"Retrieved profile_photo: {profile.get('profile_photo')}")
        
        # Check worker info from worker router
        res = await client.get(f"{API_URL}/worker/profile", headers=headers)
        worker_profile = res.json()
        print(f"Retrieved work_videos: {worker_profile.get('work_videos')}")

if __name__ == "__main__":
    asyncio.run(test_upload_flow())
