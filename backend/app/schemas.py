from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None


class UserRead(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class OptionOut(BaseModel):
    id: int
    text: str

    class Config:
        orm_mode = True


class QuestionOut(BaseModel):
    id: int
    text: str
    options: List[OptionOut]

    class Config:
        orm_mode = True


class StartExamRequest(BaseModel):
    num_questions: Optional[int] = 10
    duration_minutes: Optional[int] = 30


class StartExamResponse(BaseModel):
    session_id: int
    questions: List[QuestionOut]
    ends_at: datetime


class AnswerIn(BaseModel):
    session_question_id: int
    selected_option_id: Optional[int]


class AutosaveRequest(BaseModel):
    session_id: int
    answers: List[AnswerIn]


class SubmitRequest(BaseModel):
    session_id: int
    answers: List[AnswerIn]
