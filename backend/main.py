from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models, schemas, security, tokens
from database import engine, get_db 

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. check if email or username already exists in db — if so, raise HTTPException(400, ...)
    existing_email = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered."
        )
    existing_username = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken."
        )
    # 2. hash the password using your security.py function
    hashed_password = security.hash_password(user.password)
    # 3. create a new models.User(...) with the hashed password
    user_data = user.model_dump(exclude={"password"})
    new_user = models.User(**user_data, hashed_password=hashed_password)
    # 4. add it to db, commit, refresh
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An error occured while creating user."
        )
    # 5. return it
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. look up user by email
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    # 2. if no user found OR password doesn't verify → raise HTTPException(401, "Invalid email or password")
    if not db_user or not security.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    # 3. if valid, create an access token with the user's id as the "sub"
    access_token = tokens.create_access_token(
        data={"sub": str(db_user.id)}
    )
    # 4. return {"access_token": ..., "token_type": "bearer"}
    return {"access_token": access_token, "token_type": "bearer"}