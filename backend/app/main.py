from fastapi import FastAPI
from .database import engine
from . import models
from .routers import auth, exam
from fastapi.middleware.cors import CORSMiddleware
import os

models.Base.metadata.create_all(bind=engine)  # dev only

app = FastAPI(title="Exam API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(exam.router)
