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

from typing import List, Optional
from ..schemas import NoteResponse
from fastapi import Query
from sqlalchemy import or_

@router.get("/notes", response_model=List[NoteResponse]) # we are giving list and each follows NoteResponse structure
def get_notes(
    # GET /notes?query=stress endpoint
    # If no query → return all notes
    # If query exists → filter notes by title OR content OR topic
    # SELECT * FROM notes
    # WHERE title LIKE '%stress%' OR content LIKE '%stress%' OR topic LIKE '%stress%'
    # which becomes = Note.title.ilike(...)
    query: Optional[str] = Query(None), # url can include ?query=something, or query is null
    db: Session = Depends(get_db)
):
    notes_query = db.query(Note)

    if query: # apply filtering if user searches
        search = f"%{query}%"
        notes_query = notes_query.filter(
            or_( # sqlalchemy's way of saying title or content or topic
                Note.title.ilike(search),
                Note.content.ilike(search),
                Note.topic.ilike(search)
            )
        )

    notes = db.query(Note).order_by(Note.created_at.desc()).all() # new notes first

    return notes

# DELETE /notes/{note_id} - extracts note id value
# Receive note_id from URL, Query DB for that note, If not found → return 404, If found → delete, Commit, Return confirmation

from uuid import UUID
from fastapi import HTTPException

@router.delete("/notes/{note_id}")
def delete_note(note_id: UUID, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first() # finds specific note and returns not if exists or doesnt

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note) # mark for deletion
    db.commit() # actually deletes

    return {"message": "Note deleted successfully"}

# Update should:
# Accept full body: title, content, Fetch note by id
# If not found → 404
# Replace: note.title, note.content, Re-run topic detection
# note.topic = detect_topic(...)
# Commit, Return updated note

from ..schemas import NoteUpdate

@router.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: UUID, 
    update_data: NoteUpdate, 
    db: Session = Depends(get_db)
):
    note = db.query(Note).filter(Note.id == note_id).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if update_data.title is not None:
        note.title = update_data.title

    if update_data.content is not None:
        note.content = update_data.content

    note.topic = "general"

    db.commit()
    db.refresh(note)

    return note