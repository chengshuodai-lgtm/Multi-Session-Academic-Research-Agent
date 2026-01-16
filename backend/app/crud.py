# backend/app/crud.py
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.models import ChatSession, ChatMessage
from app.schemas import SessionCreate, MessageCreate, SessionUpdate

# ====================== 会话操作函数 ======================

def create_session(db: Session, session_data: SessionCreate) -> ChatSession:
    """创建新的聊天会话"""
    # 设置默认标题
    title = session_data.title if session_data.title else "新会话"
    
    db_session = ChatSession(
        title=title
    )
    
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    return db_session

def get_session(db: Session, session_id: str) -> Optional[ChatSession]:
    """获取聊天会话"""
    return db.query(ChatSession).filter(
        ChatSession.id == session_id
    ).first()

def get_sessions(db: Session) -> List[ChatSession]:
    """获取所有聊天会话"""
    return db.query(ChatSession).order_by(ChatSession.updated_at.desc()).all()

def update_session(db: Session, session_id: str, update_data: SessionUpdate) -> Optional[ChatSession]:
    """更新会话信息"""
    session = get_session(db, session_id)
    if session:
        # 过滤掉None值，只更新提供的字段
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        if update_dict:
            for key, value in update_dict.items():
                if hasattr(session, key):
                    setattr(session, key, value)
            session.updated_at = datetime.now()
            db.commit()
            db.refresh(session)
    return session

def delete_session(db: Session, session_id: str) -> bool:
    """删除聊天会话"""
    session = get_session(db, session_id)
    if session:
        db.delete(session)
        db.commit()
        return True
    return False

# ====================== 消息操作函数 ======================

def create_message(db: Session, message_data: MessageCreate) -> ChatMessage:
    """创建消息"""
    # 确保会话存在
    session = get_session(db, message_data.session_id)
    if not session:
        raise ValueError(f"Session {message_data.session_id} not found")
    
    db_message = ChatMessage(
        session_id=session.id,
        role=message_data.role,
        content=message_data.content,
        tool_calls=message_data.tool_calls,  # 添加这行
        tool_results=message_data.tool_results  # 添加这行
    )
    
    db.add(db_message)
    
    # 更新会话时间
    session.updated_at = datetime.now()
    db.commit()
    db.refresh(db_message)
    
    return db_message

def get_messages(db: Session, session_id: str) -> List[ChatMessage]:
    """获取会话消息"""
    return db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

def get_message(db: Session, message_id: str) -> Optional[ChatMessage]:
    """获取特定消息"""
    return db.query(ChatMessage).filter(
        ChatMessage.id == message_id
    ).first()

def delete_messages(db: Session, session_id: str) -> int:
    """删除会话的所有消息"""
    result = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).delete()
    db.commit()
    return result