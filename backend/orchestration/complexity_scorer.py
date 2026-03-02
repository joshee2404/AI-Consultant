import logging
from typing import Optional

logger = logging.getLogger(__name__)


def score_data_availability(data_types: list[str]) -> int:
    """Score 1 (None) to 3 (Structured) based on data availability."""
    if not data_types:
        return 1
    if "structured" in data_types:
        return 3
    if "documents" in data_types or "logs" in data_types:
        return 2
    return 1


def score_integration_dependency(tech_stack: list[str], use_case: str) -> int:
    """Score 1 (Custom Build) to 3 (API Exists)."""
    automation_categories = {"Process Automation", "Conversational AI", "Document Intelligence"}
    
    if use_case in automation_categories:
        if len(tech_stack) > 3:
            return 3  # API Exists
        elif len(tech_stack) > 1:
            return 2  # New Connector
        return 1  # Custom Build
    return 2  # Default: New Connector


def score_real_time_requirement(use_case: str, pain_points: str = "") -> int:
    """Score 1 (Batch OK) to 3 (True RT) based on use case type."""
    real_time_categories = {"Anomaly Detection", "Conversational AI"}
    near_rt_categories = {"Recommendation Systems", "Computer Vision"}
    
    pain_lower = pain_points.lower()
    if "real-time" in pain_lower or "immediate" in pain_lower or "instant" in pain_lower:
        return 3
    if use_case in real_time_categories:
        return 3
    if use_case in near_rt_categories:
        return 2
    return 1


def classify_complexity(total_score: int) -> str:
    """Classify complexity based on total score."""
    if total_score <= 4:
        return "Low"
    elif total_score <= 7:
        return "Medium"
    return "High"


def score_opportunities(
    opportunities: list[dict],
    form_data: dict,
) -> list[dict]:
    """
    Stage 3: Deterministic rule-based complexity scoring.
    No AI — pure Python logic.
    """
    logger.info(f"[Stage 3] Scoring {len(opportunities)} opportunities")
    
    tech_stack = form_data.get("tech_stack", [])
    processes_map = {p["name"]: p for p in form_data.get("processes", [])}
    
    scored = []
    for opp in opportunities:
        process_name = opp["process_name"]
        process = processes_map.get(process_name, {})
        
        data_types = process.get("data_types", [])
        use_case = opp.get("validated_category") or opp.get("use_case_category", "")
        pain_points = process.get("pain_points", "")
        
        data_score = score_data_availability(data_types)
        integration_score = score_integration_dependency(tech_stack, use_case)
        rt_score = score_real_time_requirement(use_case, pain_points)
        
        total = data_score + integration_score + rt_score
        complexity = classify_complexity(total)
        
        opp["data_availability_score"] = data_score
        opp["integration_dependency_score"] = integration_score
        opp["real_time_requirement_score"] = rt_score
        opp["complexity_total_score"] = total
        opp["complexity_level"] = complexity
        
        scored.append(opp)
    
    logger.info("[Stage 3] Complexity scoring complete")
    return scored


def build_impact_matrix(scored_opportunities: list[dict]) -> list[dict]:
    """Build Impact/Complexity matrix data points for scatter plot."""
    matrix = []
    for opp in scored_opportunities:
        complexity_value = {"Low": 2.0, "Medium": 5.0, "High": 8.5}.get(
            opp.get("complexity_level", "Medium"), 5.0
        )
        matrix.append(
            {
                "process_name": opp["process_name"],
                "impact_score": opp.get("impact_score", 5.0),
                "complexity_score": complexity_value,
                "complexity_level": opp.get("complexity_level", "Medium"),
                "use_case_category": opp.get("validated_category") or opp.get("use_case_category"),
            }
        )
    return matrix
