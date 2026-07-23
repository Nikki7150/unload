from sqlalchemy import create_engine # type: ignore
from sqlalchemy.ext.declarative import declarative_base # type: ignore
from sqlalchemy.orm import sessionmaker # type: ignore

# what kind of database and where
SQLALCHEMY_DATABASE_URL = "sqlite:///./unload.db"

# connection object 
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# factory that creates database sessions whenever you need to talk to database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# the class every model inherits from
Base = declarative_base()