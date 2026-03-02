import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_readiness.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def apply_migrations():
    """Apply any pending schema migrations."""
    with engine.connect() as conn:
        # Check if error_message column exists, if not add it
        try:
            conn.execute(text("SELECT error_message FROM assessments LIMIT 1"))
        except Exception:
            # Column doesn't exist, add it
            try:
                conn.execute(text("ALTER TABLE assessments ADD COLUMN error_message TEXT"))
                conn.commit()
            except Exception as e:
                print(f"Migration warning: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
