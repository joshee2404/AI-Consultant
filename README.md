# AI Readiness Decision Intelligence System

> **Submit a form. Get a McKinsey-grade AI roadmap. In 30 seconds.**

A full-stack Decision Intelligence System that analyzes your business processes through a 4-stage AI pipeline and delivers a comprehensive AI Opportunity Report — powered by **Claude 3.5 Sonnet** and **Amazon Titan Embeddings** on **AWS Bedrock**

---

## Architecture Overview

```
Frontend (React)           →  AssessmentForm, ProcessingScreen, ResultsDashboard
API Server (FastAPI)       →  POST /api/assess, GET /api/result/{id}
Orchestration Pipeline     →  4-Stage Sequential Analysis
AI Models (AWS Bedrock)    →  Claude 3.5 Sonnet (×2) + Titan Embed (×1)
Database                   →  SQLite (dev) / PostgreSQL (prod)
Output Layer               →  5 Deliverables: Opportunity List, Matrix, Roadmap, Tech Stack, Summary
```

### 4-Stage Pipeline
| Stage | File | Engine | Output |
|-------|------|--------|--------|
| 1 | `analysis_engine.py` | Claude 3.5 Sonnet | AI Opportunity List |
| 2 | `embedding_service.py` | Amazon Titan | Validated Categories |
| 3 | `complexity_scorer.py` | Pure Python (no AI) | Complexity Scores + Matrix |
| 4 | `report_generator.py` | Claude 3.5 Sonnet | Roadmap + Executive Summary |

---

## Prerequisites

- **Node.js** v18+
- **Python** 3.10+
- **AWS Account** with Bedrock access
- AWS Bedrock model access enabled for:
  - `anthropic.claude-3-5-sonnet-20240620-v1:0`
  - `amazon.titan-embed-text-v1`

---

## Setup & Usage

### 1. Clone / unzip the project

```bash
cd ai-readiness
```

### 2. Configure AWS credentials

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
DATABASE_URL=sqlite:///./ai_readiness.db
```

> **Enable AWS Bedrock models** in your AWS console:
> Go to AWS Console → Bedrock → Model Access → Request access for Claude 3.5 Sonnet and Amazon Titan Embeddings.

### 3. Install & run the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`.
Swagger docs: `http://localhost:8000/docs`

### 4. Install & run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be live at `http://localhost:3000`.

---

## Using the Application

### Step 1 — Company Overview
Fill in your company name, industry, tech stack, cloud provider, budget range, and timeline.

### Step 2 — Define Business Processes
Add 1–10 business processes. For each:
- **Name**: Short label (e.g. "Invoice Processing")
- **Description**: How the process works today
- **Pain Points**: What's slow, costly, or error-prone
- **Data Types**: What data is available (structured, docs, logs, images)
- **Frequency & Team Size**: Optional context

### Step 3 — Review & Submit
Confirm your inputs and click **Generate AI Roadmap**. The 4-stage pipeline runs automatically (~30 seconds).

### Results Dashboard
You'll receive 5 deliverables:
- **Opportunities Tab**: Expandable cards with AI use case, impact score, complexity, Titan similarity score
- **Impact Matrix**: Recharts scatter plot — identify Quick Wins (top-left quadrant)
- **Roadmap Tab**: 3-phase implementation plan with milestones and AWS services
- **Tech Stack Tab**: Per-process AWS service recommendations with effort estimates
- **Executive Summary**: AI-generated narrative report

Use **Export JSON** to download the full report for external use.

---


## Project File Structure

```
ai-readiness/
├── backend/
│   ├── main.py                          # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/
│   │   └── assessment.py               # POST /assess, GET /result/:id
│   ├── models/
│   │   └── schemas.py                  # Pydantic input/output models
│   ├── services/
│   │   └── bedrock_client.py           # AWS Bedrock gateway (Claude + Titan)
│   ├── orchestration/
│   │   ├── analysis_engine.py          # Stage 1: Claude Call 1
│   │   ├── embedding_service.py        # Stage 2: Titan validation
│   │   ├── complexity_scorer.py        # Stage 3: Rule-based scoring
│   │   └── report_generator.py         # Stage 4: Claude Call 2
│   ├── prompts/
│   │   ├── analysis_prompt.py          # System + user prompt for Stage 1
│   │   └── report_prompt.py            # System + user prompt for Stage 4
│   ├── utils/
│   │   └── report_assembler.py         # Merges all stage outputs
│   └── db/
│       ├── database.py                 # SQLAlchemy session
│       └── models/
│           └── assessment.py           # Assessment + Report tables
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx                     # Main app + view state machine
│       ├── main.jsx
│       ├── services/
│       │   └── api.js                  # Axios HTTP wrapper + polling
│       └── components/
│           ├── AssessmentForm.jsx      # 3-step form wizard
│           ├── ProcessingScreen.jsx    # Live pipeline status
│           ├── ResultsDashboard.jsx    # Tabbed results view
│           ├── OpportunityCard.jsx     # Expandable opportunity item
│           ├── ImpactMatrix.jsx        # Recharts scatter plot
│           └── PhasedRoadmap.jsx       # Phase 1/2/3 timeline
│
└── docker-compose.yml
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assess` | Submit assessment, returns `assessment_id` |
| GET | `/api/result/{id}` | Poll for results (status or full report) |
| GET | `/api/assessments` | List past assessments |
| GET | `/health` | Health check |

---

## Troubleshooting

**"Access denied" or Bedrock errors**  
→ Ensure Bedrock model access is enabled in your AWS account for both models.

**Pipeline takes > 60 seconds**  
→ AWS Bedrock cold start. Normal on first call; subsequent calls are faster.

**SQLite errors on Windows**  
→ Use `DATABASE_URL=sqlite:///C:/path/to/ai_readiness.db` with absolute path.

**CORS errors in browser**  
→ Ensure backend is running on port 8000 and frontend on 3000. Check `vite.config.js` proxy settings.
