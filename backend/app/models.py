# define a Note model that matches Supabase table:
# id
# title
# content
# topic
# created_at
# basically python representation of the table above
# ORM - Object Relational Mapper = does mapping between pyhton and database
# every model must inherit from base

from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.sql import func
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func

# inherit from base 
from .database import Base
class Note(Base):
    # tell sqlalchemy which table
    __tablename__ = "notes"

    # define columns
    # needs type, if primary key and default value
    id = Column(
        UUID(as_uuid=True), # makes proper uuid object
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    title = Column(
        Text, 
        nullable=False # required
    )

    content = Column(
        Text, 
        nullable=False
    )

    topic = Column(
        Text, 
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now() # tells database time instead of python time
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )

    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"),
        nullable=False
    ) # each note belongs to one user

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False) # hashed password: we never store raw passwords 
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# When user signs up:
# Receive email + password
# Hash password - passlib[bcrypt]
# Create user
# Return success

# Login flow:
# Receive email + password
# Find user by email
# Verify password
# Generate JWT token
# Return token
# JWT = proof of identity. - python-jose