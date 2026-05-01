# AdmitIQ — Admission Chance Predictor

Full-stack ML web application: **React frontend + FastAPI backend + scikit-learn Linear Regression model**.

---

## Project Structure

```
admission-backend/       ← Python backend
├── train_model.py       ← Downloads data, trains model, saves artifacts
├── main.py              ← FastAPI server with /predict endpoint
├── requirements.txt     ← Python dependencies
├── model/               ← Auto-created after training
│   ├── admission_model.pkl
│   ├── scaler.pkl
│   └── metadata.json

admission-frontend/      ← React frontend (Vite)
└── src/
    └── AdmissionPredictor.jsx
```

---

## Quickstart

### 1 — Backend Setup

```bash
cd admission-backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the model (downloads dataset, saves .pkl files)
python train_model.py

# Start the API server
uvicorn main:app --reload --port 8000
```

API is now running at → http://localhost:8000  
Interactive docs at  → http://localhost:8000/docs

---

### 2 — Frontend Setup

```bash
# Create a new Vite + React project
npm create vite@latest admission-frontend -- --template react
cd admission-frontend

# Install dependencies
npm install

# Copy AdmissionPredictor.jsx into src/
# Then in src/App.jsx, import and use it:
#   import AdmissionPredictor from './AdmissionPredictor'
#   export default function App() { return <AdmissionPredictor /> }

npm run dev
```

Frontend runs at → http://localhost:5173

---

### 3 — Connect Frontend to Real Backend

In `AdmissionPredictor.jsx`, replace the Claude API call with:

```javascript
const handlePredict = async () => {
  setLoading(true);
  setError(null);

  try {
    const res = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gre_score: values.gre,
        toefl_score: values.toefl,
        university_rating: values.university_rating,
        sop: values.sop,
        lor: values.lor,
        cgpa: values.cgpa,
        research: values.research,
      }),
    });

    const data = await res.json();
    setResult(data);
  } catch (e) {
    setError("Could not reach prediction server. Is the backend running?");
  } finally {
    setLoading(false);
  }
};
```

---

## API Reference

| Method | Endpoint         | Description                          |
|--------|------------------|--------------------------------------|
| GET    | `/`              | Health check + model info            |
| GET    | `/model/info`    | Metrics, coefficients, feature list  |
| POST   | `/predict`       | Single applicant prediction          |
| POST   | `/predict/batch` | Batch prediction (up to 50)          |

### POST `/predict` — Request Body

```json
{
  "gre_score": 320,
  "toefl_score": 110,
  "university_rating": 4,
  "sop": 4.5,
  "lor": 4.0,
  "cgpa": 9.0,
  "research": 1
}
```

### POST `/predict` — Response

```json
{
  "probability": 0.8912,
  "probability_pct": "89.1%",
  "verdict": "Strong Admit",
  "verdict_emoji": "🎓",
  "input": { ... }
}
```

### GET `/model/info` — Response

```json
{
  "algorithm": "Linear Regression",
  "metrics": {
    "mae": 0.0421,
    "mse": 0.0031,
    "rmse": 0.0558,
    "r2": 0.8201
  },
  "feature_importance": [
    { "feature": "CGPA", "coefficient": 0.118 },
    { "feature": "Research", "coefficient": 0.024 },
    ...
  ]
}
```

---

## Verdict Thresholds

| Probability | Verdict       |
|-------------|---------------|
| ≥ 75%       | 🎓 Strong Admit |
| ≥ 60%       | ✅ Good Chance  |
| ≥ 45%       | ⚡ Moderate     |
| < 45%       | 📈 Low Chance   |

---

## Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Frontend  | React, Vite, Tailwind CSS      |
| Backend   | FastAPI, Uvicorn               |
| ML Model  | scikit-learn LinearRegression  |
| Data      | pandas, numpy                  |
| Serving   | pickle, StandardScaler         |