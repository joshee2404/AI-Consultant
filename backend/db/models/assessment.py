from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.sql import func
import uuid
from db.database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_name = Column(String, nullable=False)
    industry = Column(String)
    status = Column(String, default="pending")  # pending | processing | complete | error
    error_message = Column(Text, nullable=True)  # Store error details if pipeline fails
    input_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String, nullable=False)
    opportunity_list = Column(JSON)
    impact_matrix = Column(JSON)
    complexity_scores = Column(JSON)
    phased_roadmap = Column(JSON)
    tech_stack_recommendations = Column(JSON)
    executive_summary = Column(Text)
    full_report_json = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
