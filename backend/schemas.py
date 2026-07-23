# /signup ENDPOINT THAT CONNECTS USER, DATABASE, AND SECURITY
# Pydantic = the shape of data coming in/out of the API (requests and responses)

from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserOut(BaseModel):
    email: str
    username: str
    id: int

    class Config():
        orm_mode: True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str