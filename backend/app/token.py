# When user logs in:
# Receive email + password
# Find user in DB
# Verify password
# Generate JWT token containing user_id
# Return token
# Then frontend stores token in sessionStorage.

# Encodes user_id into a signed token
# Token expires in 60 minutes
# Backend can later verify it

from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "supersecretkey"  # change later
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])