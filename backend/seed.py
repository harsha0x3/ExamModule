import os
from app.database import SessionLocal, engine, Base
from app import models
from app.crud import create_user
from app import crud
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)


def seed():
    db: Session = SessionLocal()
    # create user
    try:
        u = create_user(
            db,
            type(
                "X",
                (),
                {
                    "email": "test@example.com",
                    "password": "Password123!",
                    "full_name": "Test User",
                },
            ),
        )
    except Exception:
        pass
    # add sample questions
    q1 = models.Question(text="What is 2 + 2?", marks=1)
    q2 = models.Question(text="Which language is this project written in?", marks=1)
    db.add_all([q1, q2])
    db.commit()
    db.refresh(q1)
    db.refresh(q2)
    db.add_all(
        [
            models.Option(question_id=q1.id, text="3", is_correct=False),
            models.Option(question_id=q1.id, text="4", is_correct=True),
            models.Option(question_id=q1.id, text="22", is_correct=False),
            models.Option(question_id=q2.id, text="Python", is_correct=True),
            models.Option(question_id=q2.id, text="Java", is_correct=False),
            models.Option(question_id=q2.id, text="C++", is_correct=False),
        ]
    )
    db.commit()
    print("Seed complete: user test@example.com / Password123!")


if __name__ == "__main__":
    seed()
