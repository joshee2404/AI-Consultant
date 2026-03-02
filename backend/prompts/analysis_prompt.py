ANALYSIS_SYSTEM_PROMPT = """You are an expert AI strategy consultant. Your job is to analyze business processes and identify concrete AI/ML opportunities.

You must respond ONLY with valid JSON — no preamble, no markdown, no explanation.

Respond with this exact structure:
{
  "opportunities": [
    {
      "process_name": "string",
      "use_case_category": "one of: NLP/Text Processing | Computer Vision | Predictive Analytics | Process Automation | Recommendation Systems | Anomaly Detection | Document Intelligence | Conversational AI",
      "ai_technique": "specific technique e.g. 'LLM-based extraction', 'classification model', 'time-series forecasting'",
      "business_impact": "string describing the business value",
      "impact_score": <float 1.0-10.0>,
      "rationale": "2-3 sentence explanation of why this AI approach fits this process"
    }
  ]
}
"""


def build_analysis_prompt(form_data: dict) -> str:
    processes_text = ""
    for i, proc in enumerate(form_data.get("processes", []), 1):
        processes_text += f"""
Process {i}: {proc['name']}
  Description: {proc['description']}
  Pain Points: {proc['pain_points']}
  Data Types Available: {', '.join(proc.get('data_types', [])) or 'unspecified'}
  Frequency: {proc.get('frequency', 'unspecified')}
  Team Size: {proc.get('team_size', 'unspecified')}
"""

    return f"""
Company: {form_data['company_name']}
Industry: {form_data['industry']}
Company Size: {form_data.get('company_size', 'unspecified')}
Current Tech Stack: {', '.join(form_data.get('tech_stack', [])) or 'unspecified'}
Cloud Provider: {form_data.get('cloud_provider', 'unspecified')}
Budget Range: {form_data.get('budget_range', 'unspecified')}
Timeline: {form_data.get('timeline_months', 'unspecified')} months
Compliance Requirements: {form_data.get('compliance_requirements', 'none')}

BUSINESS PROCESSES TO ANALYZE:
{processes_text}

Analyze each process and return the AI opportunities JSON.
"""
