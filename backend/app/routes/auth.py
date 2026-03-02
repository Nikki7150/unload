from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import TokenResponse, UserCreate, UserLogin, UserResponse
from ..security import hash_password
from ..security import verify_password
from ..token import create_access_token
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        email = user.email,
        hashed_password = hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == form_data.username).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    if not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    
    access_token = create_access_token(
        data = {"sub": str(db_user.id)} # Because in JWT standards, "sub" means "subject" — the identity of the user.
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }