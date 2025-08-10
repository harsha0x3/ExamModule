from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random
from sqlalchemy import delete

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email, hashed_password=hashed, full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def create_exam_session(
    db: Session, user_id: int, num_questions=10, duration_minutes=30
):
    # pick random question ids
    q_ids = [q.id for q in db.query(models.Question).all()]
    if len(q_ids) == 0:
        raise Exception("No questions available")
    chosen = random.sample(q_ids, min(len(q_ids), num_questions))

    now = datetime.utcnow()
    ends = now + timedelta(minutes=duration_minutes)

    # Debug: Print the times
    print(f"Session starts at: {now.isoformat()}Z")
    print(f"Session ends at: {ends.isoformat()}Z")

    s = models.ExamSession(user_id=user_id, started_at=now, ends_at=ends)
    db.add(s)
    db.commit()
    db.refresh(s)

    for idx, qid in enumerate(chosen):
        sq = models.SessionQuestion(session_id=s.id, question_id=qid, order_index=idx)
        db.add(sq)
    db.commit()

    # prepare response questions with options (excluding is_correct)
    questions = []
    for sq in (
        db.query(models.SessionQuestion)
        .filter_by(session_id=s.id)
        .order_by(models.SessionQuestion.order_index)
        .all()
    ):
        q = db.query(models.Question).get(sq.question_id)
        opts = db.query(models.Option).filter_by(question_id=q.id).all()
        questions.append(
            {
                "id": q.id,
                "text": q.text,
                "options": [{"id": o.id, "text": o.text} for o in opts],
            }
        )
    return s, questions


def get_session(db: Session, session_id: int):
    return db.query(models.ExamSession).get(session_id)


def autosave_answers(db: Session, session_id: int, answers):
    # answers: list of {"session_question_id", "selected_option_id"}
    for a in answers:
        sqid = a["session_question_id"]
        selected = a.get("selected_option_id")
        # upsert: delete existing answer for session_question_id then insert
        existing = (
            db.query(models.Answer)
            .filter_by(session_question_id=sqid, session_id=session_id)
            .first()
        )
        if existing:
            existing.selected_option_id = selected
            existing.answered_at = datetime.utcnow()
            db.add(existing)
        else:
            new = models.Answer(
                session_id=session_id,
                session_question_id=sqid,
                selected_option_id=selected,
                answered_at=datetime.utcnow(),
            )
            db.add(new)
    db.commit()


def calculate_and_finalize(db: Session, session_id: int, mark_submit=True):
    s = db.query(models.ExamSession).get(session_id)
    if not s:
        return None
    # compute score using latest answers
    total_marks = 0
    scored = 0
    for sq in s.session_questions:
        q = db.query(models.Question).get(sq.question_id)
        total_marks += q.marks
        ans = (
            db.query(models.Answer)
            .filter_by(session_id=session_id, session_question_id=sq.id)
            .first()
        )
        if ans and ans.selected_option_id:
            opt = db.query(models.Option).get(ans.selected_option_id)
            if opt and opt.is_correct:
                scored += q.marks
    s.score = scored
    if mark_submit:
        s.submitted_at = datetime.utcnow()
        # status already managed by caller (submitted or auto_submitted)
    db.add(s)
    db.commit()
    return {"score": scored, "total": total_marks}
