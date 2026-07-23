from sqlalchemy import create_engine 
from sqlalchemy.ext.declarative import declarative_base 
from sqlalchemy.orm import sessionmaker 

# what kind of database and where
SQLALCHEMY_DATABASE_URL = "sqlite:///./unload.db"

# connection object 
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# factory that creates database sessions whenever you need to talk to database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# give db session to whatever route asked for it, let it use it and bring it back to complete db.close()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# the class every model inherits from
Base = declarative_base()