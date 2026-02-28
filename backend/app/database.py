# # This file will:
# Load environment variable
# Create SQLAlchemy engine
# Create session maker
# Handle connection to Supabase

# Conceptually, this file does:
# Read DATABASE_URL
# Create engine
# Connect to PostgreSQL
# Provide session access to routes


import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
# load environment variable
load_dotenv()
#  extract DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")
# create SQLalchemy engine to connect database
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True # prevents stale connections
)
# create a sessionmaker
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# base class for models
Base = declarative_base()

# Dependecy for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()