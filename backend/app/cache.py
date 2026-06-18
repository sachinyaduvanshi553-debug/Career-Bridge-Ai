import os
import redis.asyncio as redis
import json
import hashlib
from typing import Any, Optional
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis: Optional[redis.Redis] = None
        self.enabled = False

    async def connect(self):
        try:
            self.redis = redis.from_url(self.redis_url, encoding="utf-8", decode_responses=True)
            await self.redis.ping()
            self.enabled = True
            logger.info(f"🚀 Connected to Redis at {self.redis_url}")
        except Exception as e:
            logger.warning(f"⚠️ Redis connection failed: {e}. Caching disabled.")
            self.redis = None
            self.enabled = False

    async def disconnect(self):
        if self.redis:
            await self.redis.close()

    async def get(self, key: str) -> Optional[Any]:
        if not self.enabled or not self.redis:
            return None
        try:
            data = await self.redis.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Redis GET error: {e}")
            return None

    async def set(self, key: str, value: Any, expire: int = 3600):
        if not self.enabled or not self.redis:
            return
        try:
            await self.redis.set(key, json.dumps(value), ex=expire)
        except Exception as e:
            logger.error(f"Redis SET error: {e}")

    def get_prompt_hash(self, prompt: str) -> str:
        return hashlib.md5(prompt.encode()).hexdigest()

cache_manager = CacheManager()
