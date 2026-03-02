import json
import logging
from services.bedrock_client import invoke_claude
from prompts.report_prompt import REPORT_SYSTEM_PROMPT, build_report_prompt

logger = logging.getLogger(__name__)


def generate_report(form_data: dict, scored_opportunities: list[dict]) -> dict:
    """
    Stage 4: Claude generates executive summary, phased roadmap, and tech recommendations.
    """
    logger.info(f"[Stage 4] Generating report for {len(scored_opportunities)} opportunities")
    
    user_message = build_report_prompt(form_data, scored_opportunities)
    
    raw_response = invoke_claude(
        system_prompt=REPORT_SYSTEM_PROMPT,
        user_message=user_message,
        max_tokens=4096,
    )

    raw_response = raw_response.strip()
    if raw_response.startswith("```"):
        raw_response = raw_response.split("```")[1]
        if raw_response.startswith("json"):
            raw_response = raw_response[4:]
    
    result = json.loads(raw_response)
    logger.info("[Stage 4] Report generation complete")
    return result
