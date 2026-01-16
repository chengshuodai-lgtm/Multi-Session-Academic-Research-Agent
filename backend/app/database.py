# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

from app.config import settings

engine = create_engine(
    settings.database_url, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 可以多次调用：
# 1. 首次调用时创建数据库和数据表
# 2. 之后的调用不会重复创建
def create_tables():
    Base.metadata.create_all(bind=engine)
