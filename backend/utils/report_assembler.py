import logging
from orchestration.analysis_engine import run_analysis
from orchestration.embedding_service import validate_opportunities
from orchestration.complexity_scorer import score_opportunities, build_impact_matrix
from orchestration.report_generator import generate_report

logger = logging.getLogger(__name__)


def assemble_full_report(form_data: dict, assessment_id: str) -> dict:
    """
    Runs the full 4-stage pipeline and assembles the final report.
    
    Stage 1: Claude analyzes patterns → Opportunity List
    Stage 2: Titan validates use case mapping → Validated Opportunities  
    Stage 3: Rule-based complexity scoring → Complexity Scores + Matrix
    Stage 4: Claude generates report narrative → Roadmap + Summary
    """
    logger.info(f"[Pipeline] Starting full assessment for {form_data['company_name']}")
    
    # Stage 1: Analysis
    opportunities = run_analysis(form_data)
    
    # Stage 2: Titan Embedding Validation
    validated_opportunities = validate_opportunities(opportunities)
    
    # Stage 3: Complexity Scoring
    scored_opportunities = score_opportunities(validated_opportunities, form_data)
    
    # Build Impact/Complexity Matrix
    impact_matrix = build_impact_matrix(scored_opportunities)
    
    # Stage 4: Report Generation
    report_narrative = generate_report(form_data, scored_opportunities)
    
    # Assemble final report
    full_report = {
        "assessment_id": assessment_id,
        "company_name": form_data["company_name"],
        "industry": form_data["industry"],
        "opportunity_list": scored_opportunities,
        "impact_matrix": impact_matrix,
        "complexity_scores": [
            {
                "process_name": opp["process_name"],
                "data_availability_score": opp["data_availability_score"],
                "integration_dependency_score": opp["integration_dependency_score"],
                "real_time_requirement_score": opp["real_time_requirement_score"],
                "total_score": opp["complexity_total_score"],
                "complexity_level": opp["complexity_level"],
            }
            for opp in scored_opportunities
        ],
        "phased_roadmap": report_narrative.get("phased_roadmap", []),
        "tech_stack_recommendations": report_narrative.get("tech_stack_recommendations", []),
        "executive_summary": report_narrative.get("executive_summary", ""),
        "status": "complete",
    }
    
    logger.info(f"[Pipeline] Assessment complete for {form_data['company_name']}")
    return full_report
