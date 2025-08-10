from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from .. import schemas, crud, models
from ..deps import get_db
from ..auth_utils import get_current_user

router = APIRouter(prefix="/exam", tags=["exam"])


@router.post("/start", response_model=schemas.StartExamResponse)
def start_exam(
    req: schemas.StartExamRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    num_q = req.num_questions or 10
    duration = req.duration_minutes or 30
    session, questions = crud.create_exam_session(
        db, user_id=current_user.id, num_questions=num_q, duration_minutes=duration
    )
    return {
        "session_id": session.id,
        "questions": questions,
        "ends_at": session.ends_at.isoformat() + "Z",  # Ensure UTC timezone marker
    }


@router.get("/session/{session_id}")
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),  # ✅ unified auth
):
    s = crud.get_session(db, session_id)
    if not s or s.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get saved answers
    answers = [
        {
            "session_question_id": ans.session_question_id,
            "selected_option_id": ans.selected_option_id,
            "answered_at": ans.answered_at,
        }
        for ans in db.query(models.Answer).filter_by(session_id=s.id).all()
    ]

    # Get questions for this session
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
                "session_question_id": sq.id,
                "question": {
                    "id": q.id,
                    "text": q.text,
                    "options": [{"id": o.id, "text": o.text} for o in opts],
                },
            }
        )

    return {
        "session": {
            "id": s.id,
            "started_at": s.started_at,
            "ends_at": s.ends_at,
            "status": s.status,
            "score": s.score,
        },
        "questions": questions,
        "answers": answers,
    }


@router.post("/autosave")
def autosave(
    req: schemas.AutosaveRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),  # ✅ unified auth
):
    s = crud.get_session(db, req.session_id)
    if not s or s.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    if s.submitted_at:
        raise HTTPException(status_code=400, detail="Session already submitted")

    # Overwrite or insert answers
    data = [
        {
            "session_question_id": a.session_question_id,
            "selected_option_id": a.selected_option_id,
        }
        for a in req.answers
    ]
    crud.autosave_answers(db, req.session_id, data)
    return {"status": "ok"}


@router.post("/submit")
def submit(
    req: schemas.SubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),  # ✅ unified auth
):
    s = crud.get_session(db, req.session_id)
    if not s or s.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")

    now = datetime.utcnow()

    # Save incoming answers before submitting
    data = [
        {
            "session_question_id": a.session_question_id,
            "selected_option_id": a.selected_option_id,
        }
        for a in req.answers
    ]
    crud.autosave_answers(db, req.session_id, data)

    # Determine submission type
    if s.ends_at and now > s.ends_at:
        s.status = "auto_submitted"
    else:
        s.status = "submitted"

    db.add(s)
    db.commit()

    result = crud.calculate_and_finalize(db, req.session_id, mark_submit=True)
    return {"status": s.status, "result": result}
