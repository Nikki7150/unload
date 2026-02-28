# Client sends title + content.
# Client should NOT send id or timestamp.

# nmever mix database and schemas because
# schemas = API input/output structure


# FastAPI doesn’t just accept random JSON.
# We define a schema using Pydantic.
# schema file: Incoming JSON → Pydantic Schema → Python Object

from pydantic import BaseModel

class NoteCreate(BaseModel):
    title: str
    content: str

# For GET, we should define a response schema. Because:
# FastAPI needs to know how to serialize UUID
# It’s good practice
# Prevents weird JSON issues

from datetime import datetime
from uuid import UUID

class NoteResponse(BaseModel):
    id: UUID
    title: str
    content: str
    topic: str
    created_at: datetime

    class config():
        from_attributes = True #“You are allowed to convert SQLAlchemy models into this schema.”

