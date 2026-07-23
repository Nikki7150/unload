# PASSWORD HASHING HELPERS
from passlib import CryptContext

# manages hashing schemes and use bcrype specifically
pwd_context = CryptContext(schemes=["bcrypt"], deprecate="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)