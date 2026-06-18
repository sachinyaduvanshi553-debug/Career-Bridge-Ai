import pytest
from httpx import AsyncClient
from app.main import app
import json

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "version": "v1.0.0"}

@pytest.mark.asyncio
async def test_auth_login_invalid():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", json={"email": "wrong@test.com", "password": "wrong"})
    assert response.status_code == 401
    assert "Invalid credentials" in response.json().get("detail")

@pytest.mark.asyncio
async def test_resume_analyze_no_file():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/resume/analyze")
    assert response.status_code == 422 # Marshalling error, no file provided
