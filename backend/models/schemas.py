from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class DataAvailability(str, Enum):
    structured = "structured"
    documents = "documents"
    logs = "logs"
    images = "images"
    none = "none"


class ProcessInput(BaseModel):
    name: str = Field(..., description="Name of the business process")
    description: str = Field(..., description="Description of the workflow")
    pain_points: str = Field(..., description="Current challenges or inefficiencies")
    data_types: List[DataAvailability] = Field(default=[], description="Types of data available")
    frequency: Optional[str] = Field(None, description="How often this process runs")
    team_size: Optional[int] = Field(None, description="Number of people involved")


class AssessmentInput(BaseModel):
    company_name: str
    industry: str
    company_size: Optional[str] = None
    tech_stack: List[str] = Field(default=[], description="Current tools, cloud, integrations")
    cloud_provider: Optional[str] = Field(None, description="AWS / Azure / GCP / None")
    budget_range: Optional[str] = None
    timeline_months: Optional[int] = None
    compliance_requirements: Optional[str] = None
    processes: List[ProcessInput] = Field(..., min_items=1, max_items=10)


class OpportunityItem(BaseModel):
    process_name: str
    use_case_category: str
    ai_technique: str
    business_impact: str
    impact_score: float  # 1-10
    rationale: str
    similarity_score: Optional[float] = None
    validated_category: Optional[str] = None


class ComplexityScore(BaseModel):
    process_name: str
    data_availability_score: int  # 1-3
    integration_dependency_score: int  # 1-3
    real_time_requirement_score: int  # 1-3
    total_score: int
    complexity_level: str  # Low / Medium / High


class MatrixPoint(BaseModel):
    process_name: str
    impact_score: float
    complexity_score: float
    complexity_level: str
    use_case_category: str


class RoadmapPhase(BaseModel):
    phase: int
    title: str
    duration: str
    opportunities: List[str]
    milestones: List[str]
    aws_services: List[str]


class TechRecommendation(BaseModel):
    process_name: str
    recommended_services: List[str]
    rationale: str
    estimated_effort: str


class AssessmentReport(BaseModel):
    assessment_id: str
    company_name: str
    opportunity_list: List[OpportunityItem]
    impact_matrix: List[MatrixPoint]
    complexity_scores: List[ComplexityScore]
    phased_roadmap: List[RoadmapPhase]
    tech_stack_recommendations: List[TechRecommendation]
    executive_summary: str
    status: str = "complete"
