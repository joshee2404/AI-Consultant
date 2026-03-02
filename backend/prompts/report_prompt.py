REPORT_SYSTEM_PROMPT = """You are a senior AI strategy consultant writing an executive-grade AI transformation report.

You must respond ONLY with valid JSON — no preamble, no markdown.

Respond with this exact structure:
{
  "executive_summary": "3-4 paragraph narrative summary of findings and strategic recommendations",
  "phased_roadmap": [
    {
      "phase": 1,
      "title": "string",
      "duration": "e.g. Month 1-3",
      "opportunities": ["process_name1", "process_name2"],
      "milestones": ["milestone1", "milestone2", "milestone3"],
      "aws_services": ["service1", "service2"]
    }
  ],
  "tech_stack_recommendations": [
    {
      "process_name": "string",
      "recommended_services": ["AWS service 1", "AWS service 2"],
      "rationale": "why these services for this process",
      "estimated_effort": "e.g. 2-4 weeks"
    }
  ]
}

Phase 1 = Quick Wins (Low complexity, High impact)
Phase 2 = Core Transformation (Medium complexity)
Phase 3 = Advanced Capabilities (High complexity)
"""


def build_report_prompt(form_data: dict, scored_opportunities: list) -> str:
    opps_text = ""
    for opp in scored_opportunities:
        opps_text += f"""
- {opp['process_name']}: {opp['use_case_category']} | Impact: {opp['impact_score']}/10 | Complexity: {opp.get('complexity_level', 'Medium')}
  {opp['rationale']}
"""

    return f"""
Company: {form_data['company_name']} | Industry: {form_data['industry']}
Cloud Provider: {form_data.get('cloud_provider', 'AWS')}
Timeline: {form_data.get('timeline_months', 12)} months
Budget: {form_data.get('budget_range', 'unspecified')}
Compliance: {form_data.get('compliance_requirements', 'none')}

SCORED AI OPPORTUNITIES:
{opps_text}

Generate the full executive report JSON with roadmap and tech recommendations.
"""
