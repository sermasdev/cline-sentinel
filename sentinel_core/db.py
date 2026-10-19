import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from sentinel_core.config import settings
from sentinel_core.models import Base

logger = logging.getLogger("sentinel.db")

def get_engine(db_url: str = None):
    url = db_url or settings.DATABASE_URL
    if url.startswith("sqlite"):
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )
    return create_engine(
        url,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True
    )

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db(target_engine=None):
    eng = target_engine or engine
    Base.metadata.create_all(bind=eng)
    logger.info("Database tables initialized successfully")

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
