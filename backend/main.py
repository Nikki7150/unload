from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models, schemas, security, tokens
from database import engine, get_db 
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # 1. decode the token using tokens.decode_access_token(token)
    decoded_token = tokens.decode_access_token(token)
    # 2. if it returns None (invalid/expired) → raise HTTPException(401, "Invalid or expired token")
    if decoded_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )
    # 3. otherwise, the decoded value is the user's id (as a string) — query the db for that user
    user = db.query(models.User).filter(models.User.id == int(decoded_token)).first()
    # 4. if no user found with that id → raise HTTPException(401, "User not found")
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )
    # 5. return the user object
    return user

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

@app.post("/notes", response_model=schemas.NoteOut)
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. create a new models.Note(...) using the fields from `note`, plus user_id from current_user.id
    note_data = note.model_dump()
    db_note = models.Note(**note_data, user_id=current_user.id)
    # 2. add it to db, commit, refresh (same try/except/rollback pattern as signup)
    try:
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An error occured while creating note."
        )
    # 3. return the new note
    return db_note

@app.get("/notes", response_model=list[schemas.NoteOut])
def get_notes(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # return all notes belonging to current_user
    notes = db.query(models.Note).filter(models.Note.user_id == current_user.id).all()
    return notes

@app.get("/notes/{note_id}", response_model=schemas.NoteOut)
def get_note(note_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. query for the note matching note_id
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    # 2. if not found → raise HTTPException(404, "Note not found")
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    # 3. IMPORTANT: check that note.user_id == current_user.id — if not, raise HTTPException(403, "Not authorized to view this note")
    if note.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this note"
        )
    # 4. return the note
    return note

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. query for the note matching note_id
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    # 2. if not found → raise HTTPException(404, "Note not found")
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    # 3. IMPORTANT: check that note.user_id == current_user.id — if not, raise HTTPException(403, "Not authorized to view this note")
    if note.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this note"
        )
    # 4. return the note
    try: 
        db.delete(note)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An error occured while deleting note."
        )
    return {"detail": "Note deleted successfully"}
