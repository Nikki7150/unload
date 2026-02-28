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

#validate at least one field to be changed
# can change only title or content or both
# So: Empty string, Only whitespace, Both fields missing → should trigger 422.

from typing import Optional
from pydantic import BaseModel, field_validator, model_validator

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

    @field_validator("title", "content") # runs on each field individually
    @classmethod
    def not_empty_if_provided(cls, value):
        if value is not None and not value.strip():
            raise ValueError("Field cannot be Empty or Whitespace")
        return value
    @model_validator(mode="after") # runs after fields are parsed and checks whole object
    def at_least_one_field(self):
        if self.title is None and self.content is None:
            raise ValueError("At least one field should be provided")
        return self