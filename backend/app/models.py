from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import datetime


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sessions = relationship("ExamSession", back_populates="user")


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)
    marks = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    options = relationship("Option", back_populates="question")


class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)

    question = relationship("Question", back_populates="options")


class ExamSession(Base):
    __tablename__ = "exam_sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    ends_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    status = Column(
        String(50), default="in_progress"
    )  # in_progress, submitted, auto_submitted
    score = Column(Integer, nullable=True)

    user = relationship("User", back_populates="sessions")
    session_questions = relationship("SessionQuestion", back_populates="session")
    answers = relationship("Answer", back_populates="session")


class SessionQuestion(Base):
    __tablename__ = "session_questions"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("exam_sessions.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    order_index = Column(Integer, default=0)

    session = relationship("ExamSession", back_populates="session_questions")
    question = relationship("Question")


class Answer(Base):
    __tablename__ = "answers"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("exam_sessions.id"))
    session_question_id = Column(Integer, ForeignKey("session_questions.id"))
    selected_option_id = Column(Integer, nullable=True)
    answered_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("ExamSession", back_populates="answers")
