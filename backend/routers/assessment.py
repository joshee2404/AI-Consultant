import uuid
import json
import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from models.schemas import AssessmentInput, AssessmentReport
from db.database import get_db, SessionLocal
from db.models.assessment import Assessment, Report
from utils.configure_logging import configure_logging
from utils.report_assembler import assemble_full_report
from services.bedrock_client import invoke_claude


configure_logging(logging.INFO)


logger = logging.getLogger(__name__)
router = APIRouter()


def run_pipeline_background(assessment_id: str, form_data: dict):
    """Run the full pipeline in the background with its own DB session."""
    db = SessionLocal()
    try:
        # Update status to processing
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if assessment:
            assessment.status = "processing"
            db.commit()
        
        # Run 4-stage pipeline
        logger.info(f"[Background] Starting pipeline for assessment {assessment_id}")
        full_report = assemble_full_report(form_data, assessment_id)
        logger.info(f"[Background] Pipeline complete, validating report structure")
        
        # Validate required fields
        required_fields = [
            "opportunity_list", "impact_matrix", "complexity_scores",
            "phased_roadmap", "tech_stack_recommendations", "executive_summary"
        ]
        missing_fields = [f for f in required_fields if f not in full_report]
        if missing_fields:
            raise ValueError(f"Report missing fields: {missing_fields}")
        
        # Save report to DB
        logger.info(f"[Background] Saving report to database")
        report = Report(
            id=str(uuid.uuid4()),
            assessment_id=assessment_id,
            opportunity_list=full_report["opportunity_list"],
            impact_matrix=full_report["impact_matrix"],
            complexity_scores=full_report["complexity_scores"],
            phased_roadmap=full_report["phased_roadmap"],
            tech_stack_recommendations=full_report["tech_stack_recommendations"],
            executive_summary=full_report["executive_summary"],
            full_report_json=full_report,
        )
        db.add(report)
        
        # Mark assessment as complete
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if assessment:
            assessment.status = "complete"
        db.commit()
        
        logger.info(f"[Background] Assessment {assessment_id} completed successfully")
    
    except Exception as e:
        error_details = f"{type(e).__name__}: {str(e)}"
        logger.error(f"[Background] Assessment {assessment_id} failed: {error_details}", exc_info=True)
        try:
            assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
            if assessment:
                assessment.status = "error"
                assessment.error_message = error_details
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


@router.post("/assess", response_model=dict)
async def submit_assessment(
    payload: AssessmentInput,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Submit a new AI readiness assessment."""
    assessment_id = str(uuid.uuid4())
    
    # Save assessment to DB
    assessment = Assessment(
        id=assessment_id,
        company_name=payload.company_name,
        industry=payload.industry,
        status="pending",
        input_data=payload.dict(),
    )
    db.add(assessment)
    db.commit()
    
    # Run pipeline in background — creates its own DB session
    form_data = payload.dict()
    background_tasks.add_task(run_pipeline_background, assessment_id, form_data)
    
    return {
        "assessment_id": assessment_id,
        "status": "processing",
        "message": "Assessment submitted. Use /api/result/{assessment_id} to poll for results.",
    }


@router.get("/result/{assessment_id}", response_model=dict)
def get_result(assessment_id: str, db: Session = Depends(get_db)):
    """Poll for assessment results."""
    try:
        logger.info(f"[Result] Querying assessment {assessment_id}")
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            logger.warning(f"[Result] Assessment {assessment_id} not found")
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        logger.info(f"[Result] Assessment status: {assessment.status}")
        if assessment.status == "error":
            error_msg = assessment.error_message or "Assessment pipeline failed"
            logger.error(f"[Result] Assessment error: {error_msg}")
            raise HTTPException(status_code=500, detail=error_msg)
        
        if assessment.status in ("pending", "processing"):
            logger.info(f"[Result] Assessment still processing")
            return {"assessment_id": assessment_id, "status": assessment.status}
        
        # Complete — fetch report
        logger.info(f"[Result] Fetching report for assessment {assessment_id}")
        report = db.query(Report).filter(Report.assessment_id == assessment_id).first()
        if not report:
            logger.error(f"[Result] Report not found for assessment {assessment_id}")
            raise HTTPException(status_code=404, detail="Report not found")
        
        if not report.full_report_json:
            logger.error(f"[Result] Report full_report_json is empty for assessment {assessment_id}")
            raise HTTPException(status_code=500, detail="Report data is incomplete")
        
        logger.info(f"[Result] Successfully returning report for {assessment_id}")
        return report.full_report_json
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Result] Unexpected error for {assessment_id}: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving result: {type(e).__name__}: {str(e)}")


@router.get("/assessments", response_model=list)
def list_assessments(db: Session = Depends(get_db)):
    """List all past assessments."""
    assessments = db.query(Assessment).order_by(Assessment.created_at.desc()).limit(50).all()
    return [
        {
            "id": a.id,
            "company_name": a.company_name,
            "industry": a.industry,
            "status": a.status,
            "created_at": str(a.created_at),
        }
        for a in assessments
    ]


# ── Chat ─────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


@router.post("/chat/{assessment_id}", response_model=dict)
def chat_with_report(
    assessment_id: str,
    body: ChatRequest,
    db: Session = Depends(get_db),
):
    """Chat with Claude about a completed assessment report.
    
    Claude receives the full report JSON as context on every request,
    so it can answer questions grounded in the actual report data.
    History is passed for multi-turn conversation continuity.
    """
    # Fetch the report
    report = db.query(Report).filter(Report.assessment_id == assessment_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found for this assessment ID")

    if not report.full_report_json:
        raise HTTPException(status_code=400, detail="Report data is incomplete — cannot chat yet")

    # Build system prompt with full report as grounding context
    system_prompt = f"""You are an expert AI strategy advisor embedded inside an AI Readiness Report tool.

The user has just received a personalised AI readiness assessment. Here is their complete report data:

{json.dumps(report.full_report_json, indent=2)}

Your responsibilities:
- Answer questions grounded in this specific report — reference actual process names, impact scores, complexity levels, and AWS service recommendations from the data above
- Explain AI techniques, roadmap phases, and AWS services in plain, accessible English
- When asked why something was scored or categorised a certain way, refer back to the report data
- Offer concrete, actionable next steps based on their specific situation
- Be concise but thorough — avoid generic advice that isn't tied to their report
- Never fabricate data or scores that aren't in the report above

Tone: expert but approachable — like a senior consultant who explains things clearly without unnecessary jargon."""

    # Build conversation for Claude — history first, then the new message
    conversation = [
        {"role": msg.role, "content": msg.content}
        for msg in body.history
        if msg.role in ("user", "assistant")  # safety: only valid roles
    ]
    conversation.append({"role": "user", "content": body.message})

    logger.info(f"[Chat] assessment={assessment_id} turns={len(conversation)}")

    try:
        response_text = invoke_claude(
            system_prompt=system_prompt,
            user_message=body.message,   # kept for signature compatibility
            messages=conversation,        # actual multi-turn payload
            max_tokens=1024,
        )
        return {"role": "assistant", "content": response_text}

    except Exception as e:
        error_details = f"{type(e).__name__}: {str(e)}"
        logger.error(f"[Chat] Claude call failed for {assessment_id}: {error_details}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI response failed: {error_details}")
