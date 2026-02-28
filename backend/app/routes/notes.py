# Workflow:
# Receive title + content
# (Temporarily hardcode topic until AI step)
# Save to database
# Return saved note

# basically bridge between FastAPI and Supabase
# Frontend → FastAPI Route → Database Session → PostgreSQL

# POST /notes
# When someone sends: title, content
# The backend should:
# Receive the data
# Decide topic (for now we hardcode it)
# Create a Note object
# Save it to database
# Return the saved note

# FastAPI router
# Database dependency
# Note model
# Schema

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Note
from ..schemas import NoteCreate

router = APIRouter()

# POST /notes
@router.post("/notes")
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    # temp topic until ai added
    detected_topic = "general"

    new_note = Note(
        title =  note.title, 
        content = note.content, 
        topic = detected_topic
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note

#GET /notes endpoint
# When someone calls it:
# Open DB session
# Query all notes
# Return them
# Close session

# SQLAlchemy = db.query(Model).all() - db → active session, .query(Note) → SELECT * FROM notes, .all() → give me everything
# For GET, we should define a response schema.

from typing import List
from ..schemas import NoteResponse

@router.get("/notes", response_model=List[NoteResponse]) # we are giving list and each follows NoteResponse structure
def get_notes(db: Session = Depends(get_db)):
    notes = db.query(Note).order_by(Note.created_at.desc()).all() # new notes first

    return notes