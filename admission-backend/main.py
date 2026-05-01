"""
main.py
-------
FastAPI backend for the Admission Chance Prediction ML project.

Endpoints:
  GET  /            → health check
  GET  /model/info  → model metadata + feature importance
  POST /predict     → predict admission probability for one applicant
  POST /predict/batch → predict for multiple applicants at once
"""

import os
import pickle
import json
import httpx
import numpy as np
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# ─── Load Artifacts ──────────────────────────────────────────────────────────
MODEL_DIR = Path("model")

def load_artifacts():
    try:
        with open(MODEL_DIR / "admission_model.pkl", "rb") as f:
            model = pickle.load(f)
        with open(MODEL_DIR / "scaler.pkl", "rb") as f:
            scaler = pickle.load(f)
        with open(MODEL_DIR / "metadata.json") as f:
            metadata = json.load(f)
        return model, scaler, metadata
    except FileNotFoundError:
        raise RuntimeError(
            "Model artifacts not found. Run `python train_model.py` first."
        )

model, scaler, metadata = load_artifacts()

# ─── App Setup ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="AdmitIQ — Admission Chance Predictor",
    description="Linear Regression model predicting graduate school admission probability.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Allow requests from the React frontend (localhost:5173 is default Vite port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Schemas ─────────────────────────────────────────────────────────────────
class ApplicantProfile(BaseModel):
    gre_score: float = Field(..., ge=260, le=340, description="GRE Score (260–340)")
    toefl_score: float = Field(..., ge=0, le=120, description="TOEFL Score (0–120)")
    university_rating: float = Field(..., ge=1, le=5, description="University Rating (1–5)")
    sop: float = Field(..., ge=1, le=5, description="Statement of Purpose strength (1–5)")
    lor: float = Field(..., ge=1, le=5, description="Letter of Recommendation strength (1–5)")
    cgpa: float = Field(..., ge=0, le=10, description="Cumulative GPA (0–10)")
    research: int = Field(..., ge=0, le=1, description="Research experience: 0 = No, 1 = Yes")

    class Config:
        schema_extra = {
            "example": {
                "gre_score": 320,
                "toefl_score": 110,
                "university_rating": 4,
                "sop": 4.5,
                "lor": 4.0,
                "cgpa": 9.0,
                "research": 1
            }
        }


class PredictionResult(BaseModel):
    probability: float
    probability_pct: str
    verdict: str
    verdict_emoji: str
    input: ApplicantProfile


class BatchRequest(BaseModel):
    applicants: List[ApplicantProfile]


class BatchResult(BaseModel):
    results: List[PredictionResult]
    count: int

class InsightsRequest(BaseModel):
    profile: ApplicantProfile
    probability: float
    verdict: str

# ─── Helpers ─────────────────────────────────────────────────────────────────
FEATURE_ORDER = [
    "GRE Score", "TOEFL Score", "University Rating",
    "SOP", "LOR ", "CGPA", "Research"
]

def profile_to_array(p: ApplicantProfile) -> np.ndarray:
    """Convert a pydantic profile to a numpy row in the correct feature order."""
    return np.array([[
        p.gre_score,
        p.toefl_score,
        p.university_rating,
        p.sop,
        p.lor,
        p.cgpa,
        p.research,
    ]])

def classify(prob: float) -> tuple[str, str]:
    """Return (verdict text, emoji) based on probability."""
    if prob >= 0.75:
        return "Strong Admit", "🎓"
    elif prob >= 0.60:
        return "Good Chance", "✅"
    elif prob >= 0.45:
        return "Moderate", "⚡"
    else:
        return "Low Chance", "📈"

def run_prediction(profile: ApplicantProfile) -> PredictionResult:
    X = profile_to_array(profile)
    X_scaled = scaler.transform(X)
    raw = float(model.predict(X_scaled)[0])
    prob = round(max(0.0, min(1.0, raw)), 4)      # clamp to [0, 1]
    verdict, emoji = classify(prob)

    return PredictionResult(
        probability=prob,
        probability_pct=f"{prob * 100:.1f}%",
        verdict=verdict,
        verdict_emoji=emoji,
        input=profile,
    )

# ─── Routes ──────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": "AdmitIQ Admission Predictor",
        "model": "Linear Regression",
        "r2_score": metadata["metrics"]["r2"],
        "docs": "/docs",
    }


@app.get("/model/info", tags=["Model"])
def model_info():
    """Return model metadata, metrics, and feature coefficients."""
    sorted_features = sorted(
        metadata["coefficients"].items(),
        key=lambda x: abs(x[1]),
        reverse=True,
    )
    return {
        "algorithm": "Linear Regression",
        "features": metadata["features"],
        "intercept": metadata["intercept"],
        "metrics": metadata["metrics"],
        "feature_importance": [
            {"feature": k, "coefficient": v} for k, v in sorted_features
        ],
        "training_samples": metadata["train_size"],
        "test_samples": metadata["test_size"],
    }


@app.post("/predict", response_model=PredictionResult, tags=["Prediction"])
def predict(profile: ApplicantProfile):
    """
    Predict admission probability for a single applicant.

    Returns a probability (0–1), a percentage string, and a verdict label.
    """
    try:
        return run_prediction(profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict/batch", response_model=BatchResult, tags=["Prediction"])
def predict_batch(request: BatchRequest):
    """
    Predict admission probability for multiple applicants at once.
    Maximum 50 applicants per request.
    """
    if len(request.applicants) > 50:
        raise HTTPException(
            status_code=400,
            detail="Batch limit is 50 applicants per request."
        )
    try:
        results = [run_prediction(p) for p in request.applicants]
        return BatchResult(results=results, count=len(results))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


@app.post("/insights", tags=["Insights"])
async def get_insights(req: InsightsRequest):
    """
    Calls the Anthropic Claude API server-side (avoids browser CORS restrictions)
    and returns personalized insights based on the real ML prediction result.
    """
    if not ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY is not set. Run: export ANTHROPIC_API_KEY=sk-ant-..."
        )

    p = req.profile
    pct = round(req.probability * 100, 1)

    json_schema = '''
{
  "strongest_factor": "<feature name that contributes most positively>",
  "weakest_factor": "<feature where improvement would most increase admission chance>",
  "verdict_detail": "<one crisp sentence explaining why the model gave ''' + str(pct) + '''% specifically>",
  "insight": "<2-3 sentences of specific actionable advice referencing actual numbers>"
}'''

    prompt = f"""You are an expert graduate admissions counselor analyzing a real ML model prediction.

A Linear Regression model has already predicted this applicant's admission probability as {pct}% (verdict: {req.verdict}).

The model's actual feature coefficients from sklearn training:
- CGPA: 0.1183           (highest impact — scale 0 to 10)
- Research Experience: 0.0243  (binary: 0 or 1)
- LOR Strength: 0.0174   (scale 1 to 5)
- University Rating: 0.0059  (scale 1 to 5)
- TOEFL Score: 0.0028    (scale 0 to 120)
- SOP Strength: 0.0022   (scale 1 to 5)
- GRE Score: 0.0017      (scale 260 to 340)

Applicant's submitted values:
- GRE Score: {p.gre_score}/340 — {round(((p.gre_score - 260) / 80) * 100)}% of range
- TOEFL Score: {p.toefl_score}/120 — {round((p.toefl_score / 120) * 100)}% of range
- University Rating: {p.university_rating}/5
- SOP Strength: {p.sop}/5
- LOR Strength: {p.lor}/5
- CGPA: {p.cgpa}/10 — {round((p.cgpa / 10) * 100)}% of range
- Research Experience: {"Yes" if p.research == 1 else "No"}

Respond ONLY with a single valid JSON object. No markdown, no backticks, no explanation, no text before or after. Use this exact structure:
{json_schema}"""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-6",
                    "max_tokens": 500,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Anthropic API error {response.status_code}: {response.text}"
            )

        data = response.json()
        raw = "".join(b.get("text", "") for b in data.get("content", []))

        # Extract JSON — handles cases where Claude wraps it in ```json ... ``` or adds extra text
        import re
        json_match = re.search(r'\{[\s\S]*\}', raw)
        if not json_match:
            raise HTTPException(status_code=500, detail=f"No JSON found in Claude response: {raw}")

        clean = json_match.group(0)
        insights = json.loads(clean)
        return insights

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse failed: {e} — raw output was: {clean}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insights generation failed: {str(e)}")