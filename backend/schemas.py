# /signup ENDPOINT THAT CONNECTS USER, DATABASE, AND SECURITY
# Pydantic = the shape of data coming in/out of the API (requests and responses)

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserOut(BaseModel):
    email: str
    username: str
    id: int

    class Config():
        orm_mode = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class NoteCreate(BaseModel):
    title: Optional[str] = None
    journal: str
    topic: Optional[str] = None

class NoteOut(BaseModel):
    title: Optional[str] = None
    journal: str
    topic: Optional[str] = None
    id: int
    created_at: datetime

    class Config():
        orm_mode = True