import asyncio
import httpx
import os
import secrets

API_URL = "http://localhost:8000/api"
TEST_EMAIL = f"pro_{secrets.token_hex(4)}@example.com"
TEST_PASSWORD = "propassword123"

async def simulate_flow():
    print(f"--- Simulating Professional Flow for {TEST_EMAIL} ---")
    
    async with httpx.AsyncClient() as client:
        # 1. Register
        import random
        phone = "".join([str(random.randint(0, 9)) for _ in range(10)])
        reg_data = {
            "name": "Expert Professional",
            "email": TEST_EMAIL,
            "phone": phone,
            "location": "Bangalore",
            "role": "professional",
            "password": TEST_PASSWORD,
            "skills": ["React", "Python", "Cloud"],
            "interests": ["Machine Learning"]
        }
        res = await client.post(f"{API_URL}/auth/register", json=reg_data)
        if res.status_code != 200:
            print(f"Error Registering: {res.text}")
            return
        
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("[SUCCESS] Registered as Professional")

        # 2. Update Professional Profile
        print("2. Updating Professional Profile details...")
        update_data = {
            "current_job_title": "Senior Cloud Architect",
            "industry": "Software Engineering",
            "experience_years": 8,
            "bio": "Expert in scaling AI infrastructure.",
            "mentorship_available": True,
            "professional_projects": [
                {"title": "Global CDN", "description": "Built a global CDN for 1M+ users", "tech": "Go, AWS", "link": "https://example.com"}
            ],
            "certifications_list": [
                {"name": "AWS Pro", "issuer": "Amazon", "year": "2023", "url": "https://aws.cert/123"}
            ],
            "resume_url": "/uploads/chat/pro_resume.pdf"
        }
        res = await client.post(f"{API_URL}/profile/update", json=update_data, headers=headers)
        if res.status_code != 200:
            print(f"Error Updating Profile: {res.text}")
        else:
            print("[SUCCESS] Professional Profile Updated")

        # 3. Verify Retrieval
        print("3. Verifying Final Retrieval...")
        res = await client.get(f"{API_URL}/profile", headers=headers)
        if res.status_code != 200:
            print(f"Error Fetching Profile: {res.text}")
            return
            
        profile = res.json()
        print(f"--- Final Professional Check ---")
        print(f"Role: {profile.get('role')}")
        print(f"Job Title: {profile.get('current_job_title')}")
        print(f"Resume URL: {profile.get('resume_url')}")
        
        pro_info = profile.get("professional_info", {})
        print(f"Projects Count: {len(pro_info.get('professional_projects', []))}")
        print(f"Certifications Count: {len(pro_info.get('certifications_list', []))}")
        print(f"Mentorship: {pro_info.get('mentorship_available')}")

if __name__ == "__main__":
    asyncio.run(simulate_flow())
