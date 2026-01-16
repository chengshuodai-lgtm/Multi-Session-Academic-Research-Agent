# backend/app/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager  
from fastapi.middleware.cors import CORSMiddleware

from .database import create_tables

from app.api import router as api_router

import logging

logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("app 启动 ...")    
    create_tables() # 创建数据库和数据表
    yield
    logger.info("app 关闭 ...")    
    
app = FastAPI(
    tilte="Research Agent",
    description="An AI-powered research assistant that helps you gather and analyze information efficiently.",
    version="1.0.0",
    lifespan=lifespan  # 注册 lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应指定具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
