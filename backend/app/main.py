from fastapi import FastAPI
from .routes.notes import router as notes_router
# enabling CORS in FasrtAPI to connect backend and frontend
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from . import models
# tells to look at the model imports and add the tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(notes_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .routes import auth
app.include_router(auth.router)