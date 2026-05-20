"""
MongoDB Database Client
-----------------------
Async MongoDB connection using Motor driver.
Provides per-user interview history and stats storage.

Collections:
  - interview_sessions: Full session data per user
  - user_stats: Aggregated stats per user (cached/updated on session end)
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

MONGODB_URL: str = os.getenv("MONGODB_URL", "")
DB_NAME: str = os.getenv("MONGODB_DB_NAME", "ai_interview_hacker")

# Module-level client — initialized once on startup
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database instance. Must call connect_db() first."""
    if _db is None:
        raise RuntimeError("Database not connected. Call connect_db() on startup.")
    return _db


async def connect_db() -> None:
    """Open the MongoDB connection. Called from FastAPI lifespan."""
    global _client, _db
    if not MONGODB_URL:
        print("⚠️  MONGODB_URL not set — running without database (in-memory only)")
        return
    _client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    _db = _client[DB_NAME]
    # Verify connection
    await _client.admin.command("ping")
    print(f"✅ MongoDB connected → {DB_NAME}")

    # Create indexes for fast per-user queries
    await _db.interview_sessions.create_index([("user_id", 1), ("created_at", -1)])
    await _db.user_stats.create_index([("user_id", 1)], unique=True)


async def close_db() -> None:
    """Close the MongoDB connection. Called from FastAPI lifespan."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        print("🔌 MongoDB disconnected")


def is_db_connected() -> bool:
    """Check if database is available."""
    return _db is not None
