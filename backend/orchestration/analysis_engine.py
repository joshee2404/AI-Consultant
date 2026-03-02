import json
import logging
from services.bedrock_client import invoke_claude
from prompts.analysis_prompt import ANALYSIS_SYSTEM_PROMPT, build_analysis_prompt

logger = logging.getLogger(__name__)


def run_analysis(form_data: dict) -> list[dict]:
    """
    Stage 1: Claude analyzes patterns in business processes.
    Returns raw opportunity list JSON.
    """
    logger.info(f"[Stage 1] Running analysis for {form_data['company_name']}")
    
    user_message = build_analysis_prompt(form_data)
    
    raw_response = invoke_claude(
        system_prompt=ANALYSIS_SYSTEM_PROMPT,
        user_message=user_message,
        max_tokens=4096,
    )

    # Parse JSON response
    raw_response = raw_response.strip()
    if raw_response.startswith("```"):
        raw_response = raw_response.split("```")[1]
        if raw_response.startswith("json"):
            raw_response = raw_response[4:]
    
    result = json.loads(raw_response)
    opportunities = result.get("opportunities", [])
    
    logger.info(f"[Stage 1] Found {len(opportunities)} opportunities")
    return opportunities
