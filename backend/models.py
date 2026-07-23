from datetime import datetime

from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Text 
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    journal = Column(Text, nullable=False)
    topic = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)