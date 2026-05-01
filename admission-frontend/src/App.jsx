import { useState, useEffect, useRef } from "react";

const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=IBM+Plex+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');`;

const styles = `
  ${GOOGLE_FONTS}
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --bg: #07090f;
    --surface: #0d1117;
    --surface2: #161b24;
    --border: rgba(99,179,237,0.12);
    --accent: #63b3ed;
    --accent2: #f6c90e;
    --text: #e8edf5;
    --muted: #6e7d92;
    --success: #48d597;
    --danger: #f16868;
    --glow: rgba(99,179,237,0.15);
  }

  body { background: var(--bg); color: var(--text); font-family: 'Outfit', sans-serif; }

  .app {
    min-height: 100vh;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,179,237,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 40% 30% at 85% 80%, rgba(246,201,14,0.04) 0%, transparent 50%);
  }

  .header {
    border-bottom: 1px solid var(--border);
    padding: 20px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(13,17,23,0.8);
    backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .logo-wrap { display: flex; align-items: center; gap: 12px; }
  .logo-icon {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .logo-text { font-family: 'Playfair Display', serif; font-size: 19px; color: var(--text); }
  .logo-sub { font-size: 11px; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 1px; }

  .badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    padding: 5px 12px;
    border: 1px solid var(--border);
    border-radius: 20px;
    color: var(--accent);
    background: rgba(99,179,237,0.06);
    letter-spacing: 0.05em;
  }

  .main { max-width: 1100px; margin: 0 auto; padding: 48px 24px; }

  .hero { text-align: center; margin-bottom: 52px; }
  .hero-tag {
    display: inline-block;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: var(--accent);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 16px;
    padding: 6px 16px;
    border: 1px solid rgba(99,179,237,0.25);
    border-radius: 30px;
    background: rgba(99,179,237,0.05);
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 700;
    line-height: 1.15;
    background: linear-gradient(135deg, #e8edf5 30%, #63b3ed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 14px;
  }
  .hero p { color: var(--muted); font-size: 16px; font-weight: 300; max-width: 520px; margin: 0 auto; line-height: 1.7; }

  .grid-layout { display: grid; grid-template-columns: 1fr 380px; gap: 28px; align-items: start; }
  @media(max-width: 860px) { .grid-layout { grid-template-columns: 1fr; } }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 28px 30px;
    position: relative;
    overflow: hidden;
  }
  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,179,237,0.4), transparent);
  }
  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    color: var(--text);
    margin-bottom: 6px;
  }
  .card-sub { font-size: 13px; color: var(--muted); margin-bottom: 24px; }

  .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media(max-width: 560px) { .fields-grid { grid-template-columns: 1fr; } }

  .field-group { display: flex; flex-direction: column; gap: 7px; }
  .field-label {
    font-size: 12px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .field-range { color: rgba(99,179,237,0.6); font-size: 10px; letter-spacing: 0; text-transform: none; }
  
  .field-input-wrap { position: relative; }
  .field-input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 15px;
    font-family: 'IBM Plex Mono', monospace;
    color: var(--text);
    outline: none;
    transition: all 0.2s;
    -moz-appearance: textfield;
  }
  .field-input::-webkit-inner-spin-button,
  .field-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .field-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(99,179,237,0.1);
    background: #0f1520;
  }
  .field-input::placeholder { color: #3a4555; }

  .slider-wrap { position: relative; padding-top: 4px; }
  .range-slider {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    background: var(--surface2);
    border-radius: 4px;
    outline: none;
    cursor: pointer;
  }
  .range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px rgba(99,179,237,0.5);
    cursor: pointer;
    transition: transform 0.15s;
  }
  .range-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
  .range-ticks { display: flex; justify-content: space-between; margin-top: 5px; }
  .range-tick { font-size: 10px; color: #3a4555; font-family: 'IBM Plex Mono', monospace; }

  .toggle-wrap { display: flex; gap: 8px; }
  .toggle-btn {
    flex: 1;
    padding: 10px 0;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: var(--surface2);
    color: var(--muted);
    font-size: 13px;
    font-family: 'Outfit', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }
  .toggle-btn.active {
    border-color: var(--accent);
    background: rgba(99,179,237,0.1);
    color: var(--accent);
  }

  .predict-btn {
    width: 100%;
    margin-top: 24px;
    padding: 15px;
    background: linear-gradient(135deg, #2b6cb0, #63b3ed);
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: all 0.25s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
  }
  .predict-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .predict-btn:hover::before { opacity: 1; }
  .predict-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(99,179,237,0.3); }
  .predict-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* RESULT PANEL */
  .result-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    overflow: hidden;
    position: sticky;
    top: 84px;
  }

  .result-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--surface2);
  }
  .result-title { font-family: 'Playfair Display', serif; font-size: 17px; color: var(--text); }
  .result-sub { font-size: 12px; color: var(--muted); margin-top: 3px; }

  .result-body { padding: 24px; }

  .gauge-wrap { text-align: center; margin-bottom: 24px; }
  .gauge-svg { overflow: visible; }
  .gauge-track { fill: none; stroke: var(--surface2); stroke-width: 12; stroke-linecap: round; }
  .gauge-fill { fill: none; stroke-width: 12; stroke-linecap: round; transition: stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .gauge-pct {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 36px;
    font-weight: 500;
    fill: var(--text);
  }
  .gauge-label { font-size: 11px; fill: var(--muted); font-family: 'Outfit', sans-serif; }

  .verdict-wrap {
    text-align: center;
    padding: 14px 20px;
    border-radius: 12px;
    margin-bottom: 22px;
    font-size: 14px;
    font-weight: 600;
  }
  .verdict-strong { background: rgba(72,213,151,0.1); color: var(--success); border: 1px solid rgba(72,213,151,0.25); }
  .verdict-good { background: rgba(99,179,237,0.1); color: var(--accent); border: 1px solid rgba(99,179,237,0.25); }
  .verdict-moderate { background: rgba(246,201,14,0.1); color: var(--accent2); border: 1px solid rgba(246,201,14,0.25); }
  .verdict-low { background: rgba(241,104,104,0.1); color: var(--danger); border: 1px solid rgba(241,104,104,0.25); }

  .factors-list { display: flex; flex-direction: column; gap: 10px; }
  .factor-row { display: flex; flex-direction: column; gap: 5px; }
  .factor-meta { display: flex; justify-content: space-between; align-items: center; }
  .factor-name { font-size: 12px; color: var(--muted); }
  .factor-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: var(--text);
  }
  .factor-bar-bg { height: 4px; background: var(--surface2); border-radius: 4px; overflow: hidden; }
  .factor-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .insight-wrap {
    margin-top: 22px;
    background: var(--surface2);
    border-radius: 12px;
    padding: 16px;
    border-left: 3px solid var(--accent);
  }
  .insight-title { font-size: 11px; color: var(--accent); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
  .insight-text { font-size: 13px; color: var(--muted); line-height: 1.65; }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--muted);
  }
  .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }
  .empty-text { font-size: 14px; line-height: 1.6; }

  .loading-dots { display: flex; gap: 6px; align-items: center; justify-content: center; padding: 40px 0; }
  .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--accent);
    animation: bounce 1.2s infinite ease-in-out;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }
  @media(max-width: 640px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }

  .stat-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    transition: all 0.2s;
  }
  .stat-box:hover { border-color: rgba(99,179,237,0.3); }
  .stat-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 20px;
    color: var(--accent);
    font-weight: 500;
  }
  .stat-label { font-size: 11px; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }

  .error-msg {
    background: rgba(241,104,104,0.08);
    border: 1px solid rgba(241,104,104,0.25);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px;
    color: var(--danger);
    margin-top: 12px;
  }

  .spin { animation: spin 1s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fade-in { animation: fadeIn 0.5s ease forwards; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }

  .feature-importance {
    margin-top: 28px;
  }
  .fi-title {
    font-size: 13px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }
`;

const FEATURE_META = {
  gre: { label: "GRE Score", min: 260, max: 340, step: 1, desc: "Graduate Record Exam (260–340)" },
  toefl: { label: "TOEFL Score", min: 0, max: 120, step: 1, desc: "English proficiency (0–120)" },
  university_rating: { label: "University Rating", min: 1, max: 5, step: 1, desc: "Institution prestige (1–5)" },
  sop: { label: "SOP Strength", min: 1, max: 5, step: 0.5, desc: "Statement of Purpose (1–5)" },
  lor: { label: "LOR Strength", min: 1, max: 5, step: 0.5, desc: "Letter of Recommendation (1–5)" },
  cgpa: { label: "CGPA", min: 0, max: 10, step: 0.01, desc: "Cumulative GPA out of 10" },
  research: { label: "Research Experience", type: "toggle", desc: "Published / participated in research" },
};

// Real model coefficients from train_model.py (StandardScaler-weighted impact)
const FEATURE_WEIGHTS = {
  cgpa:               { label: "CGPA",               coef: 0.118, norm: v => v / 10 },
  research:           { label: "Research Experience", coef: 0.024, norm: v => v },
  lor:                { label: "LOR Strength",        coef: 0.017, norm: v => (v - 1) / 4 },
  university_rating:  { label: "University Rating",   coef: 0.006, norm: v => (v - 1) / 4 },
  toefl:              { label: "TOEFL Score",         coef: 0.003, norm: v => v / 120 },
  sop:                { label: "SOP Strength",        coef: 0.002, norm: v => (v - 1) / 4 },
  gre:                { label: "GRE Score",           coef: 0.002, norm: v => (v - 260) / 80 },
};

// Thresholds for what counts as "strong" vs "weak" per feature (normalized 0–1)
const STRONG_THRESHOLD = 0.75;
const WEAK_THRESHOLD   = 0.50;

function generateInsights(values, probability) {
  // Score each feature: normalized value × coefficient weight
  const scores = Object.entries(FEATURE_WEIGHTS).map(([key, meta]) => ({
    key,
    label: meta.label,
    score: meta.norm(values[key]) * meta.coef,
    normVal: meta.norm(values[key]),
    coef: meta.coef,
  }));

  // Strongest = highest weighted score
  const strongest = [...scores].sort((a, b) => b.score - a.score)[0];

  // Weakest = lowest normalized value among features with meaningful coefficient (coef > 0.002)
  const meaningful = scores.filter(s => s.coef >= 0.002);
  const weakest = [...meaningful].sort((a, b) => a.normVal - b.normVal)[0];

  // Verdict detail — one sentence summary
  const pct = Math.round(probability * 100);
  const verdictDetail =
    probability >= 0.75 ? `Your profile is highly competitive with a ${pct}% predicted probability.` :
    probability >= 0.60 ? `You have a solid profile with a ${pct}% predicted chance of admission.` :
    probability >= 0.45 ? `Your profile shows promise at ${pct}% — targeted improvements can push you over the line.` :
    `At ${pct}%, there is meaningful room to strengthen your application before applying.`;

  // Insight — personalized 2–3 sentence advice
  const cgpaNorm    = values.cgpa / 10;
  const greNorm     = (values.gre - 260) / 80;
  const toeflNorm   = values.toefl / 120;
  const lorNorm     = (values.lor - 1) / 4;
  const sopNorm     = (values.sop - 1) / 4;
  const hasResearch = values.research === 1;

  const tips = [];

  if (cgpaNorm < WEAK_THRESHOLD)
    tips.push(`Your CGPA of ${values.cgpa} is below competitive range — this is the single highest-impact factor in the model, so even a small improvement here would significantly boost your probability.`);
  else if (cgpaNorm >= STRONG_THRESHOLD)
    tips.push(`Your CGPA of ${values.cgpa} is a strong asset and the highest-weight feature — it is working heavily in your favour.`);

  if (!hasResearch)
    tips.push(`Adding research experience would directly lift your predicted score — it carries the second-highest coefficient in this model.`);
  else
    tips.push(`Your research experience gives you a clear edge over non-research applicants.`);

  if (lorNorm < WEAK_THRESHOLD)
    tips.push(`A stronger Letter of Recommendation (currently ${values.lor}/5) could noticeably improve your chances — LOR has the third-highest weight in the model.`);

  if (greNorm < 0.4)
    tips.push(`Your GRE score of ${values.gre} is on the lower end; while its individual weight is modest, a score above 310 aligns better with competitive admits.`);

  if (toeflNorm < 0.7)
    tips.push(`A TOEFL score above ${Math.round(120 * 0.7)} would put you in a stronger percentile among applicants.`);

  if (sopNorm < WEAK_THRESHOLD && lorNorm >= WEAK_THRESHOLD)
    tips.push(`Investing time in polishing your Statement of Purpose (currently ${values.sop}/5) can meaningfully differentiate your application.`);

  // Pick best 2 tips, fall back to a generic one
  if (tips.length === 0)
    tips.push(`Your profile is well-rounded across all key metrics. Focus on targeting universities with ratings matching your score range for the best outcome.`);

  const insight = tips.slice(0, 2).join(" ");

  return {
    insight,
    verdict_detail: verdictDetail,
    strongest_factor: strongest.label,
    weakest_factor: weakest.label,
  };
}

function Gauge({ value }) {
  const radius = 60;
  const cx = 80, cy = 80;
  const startAngle = -210;
  const endAngle = 30;
  const totalArc = endAngle - startAngle;
  const circumference = (Math.PI * radius * (totalArc / 180));
  const pct = Math.max(0, Math.min(1, value));
  const filled = circumference * pct;
  const empty = circumference - filled;
  const color = pct >= 0.75 ? "#48d597" : pct >= 0.55 ? "#63b3ed" : pct >= 0.4 ? "#f6c90e" : "#f16868";

  const polarToCartesian = (angle) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const d = `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`;

  return (
    <svg className="gauge-svg" width="160" height="120" viewBox="0 0 160 120">
      <path d={d} className="gauge-track" />
      <path
        d={d}
        className="gauge-fill"
        stroke={color}
        strokeDasharray={`${filled} ${empty + 1}`}
        strokeDashoffset="0"
        style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
      />
      <text x="80" y="85" textAnchor="middle" className="gauge-pct" fill={color}>
        {Math.round(pct * 100)}%
      </text>
      <text x="80" y="102" textAnchor="middle" className="gauge-label">admission chance</text>
    </svg>
  );
}

function FactorBar({ label, value, max, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="factor-row">
      <div className="factor-meta">
        <span className="factor-name">{label}</span>
        <span className="factor-val">{value}</span>
      </div>
      <div className="factor-bar-bg">
        <div className="factor-bar-fill" style={{ width: `${pct}%`, background: color || "var(--accent)" }} />
      </div>
    </div>
  );
}

export default function App() {
  const [values, setValues] = useState({
    gre: 310, toefl: 103, university_rating: 3, sop: 3.5, lor: 3.5, cgpa: 8.5, research: 0,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animated, setAnimated] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnimated(false);

    try {
      // ── Step 1: Get real ML prediction from FastAPI ──────────────────────
      const mlRes = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gre_score:         values.gre,
          toefl_score:       values.toefl,
          university_rating: values.university_rating,
          sop:               values.sop,
          lor:               values.lor,
          cgpa:              values.cgpa,
          research:          values.research,
        }),
      });

      if (!mlRes.ok) throw new Error(`Backend error: ${mlRes.status}`);
      const mlData = await mlRes.json();
      // mlData: { probability, probability_pct, verdict, verdict_emoji, input }

      // Show gauge + verdict immediately, insights still loading
      setResult({ ...mlData, insight: null, strongest_factor: null, weakest_factor: null, verdict_detail: null });
      setLoading(false);
      setInsightsLoading(true);
      setTimeout(() => setAnimated(true), 100);

      // ── Step 2: Get AI insights via backend /insights (server-side Claude call) ─
      const aiRes = await fetch("http://localhost:8000/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            gre_score:         values.gre,
            toefl_score:       values.toefl,
            university_rating: values.university_rating,
            sop:               values.sop,
            lor:               values.lor,
            cgpa:              values.cgpa,
            research:          values.research,
          },
          probability: mlData.probability,
          verdict:     mlData.verdict,
        }),
      });

      if (!aiRes.ok) throw new Error(`Insights error: ${aiRes.status}`);
      const insights = await aiRes.json();

      setResult(prev => ({ ...prev, ...insights }));

    } catch (e) {
      setError(e.message.includes("Failed to fetch")
        ? "Cannot reach the prediction server. Make sure your FastAPI backend is running on port 8000."
        : `Error: ${e.message}`
      );
    } finally {
      setLoading(false);
      setInsightsLoading(false);
    }
  };

  const verdictClass = result ? {
    "Strong Admit": "verdict-strong",
    "Good Chance": "verdict-good",
    "Moderate": "verdict-moderate",
    "Low Chance": "verdict-low",
  }[result.verdict] || "verdict-good" : "";

  const verdictEmoji = result?.verdict_emoji || "📊";

  const barColors = {
    gre: "#63b3ed",
    toefl: "#a78bfa",
    cgpa: "#48d597",
    university_rating: "#f6c90e",
    sop: "#fb923c",
    lor: "#f472b6",
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <div className="logo-wrap">
            <div className="logo-icon">🎓</div>
            <div>
              <div className="logo-text">AdmitIQ</div>
              <div className="logo-sub">Admission Intelligence</div>
            </div>
          </div>
          <span className="badge">Linear Regression · ML</span>
        </header>

        <main className="main">
          <div className="hero">
            <div className="hero-tag">Powered by Machine Learning</div>
            <h1>Predict Your Admission Chances</h1>
            <p>Enter your academic profile below and get an instant AI-powered prediction of your graduate school admission probability.</p>
          </div>

          <div className="stats-row">
            {[
              { val: "500+", label: "Data Points" },
              { val: "7", label: "Features Used" },
              { val: "R²≈0.82", label: "Model Accuracy" },
              { val: "LR", label: "Algorithm" },
            ].map(s => (
              <div className="stat-box" key={s.label}>
                <div className="stat-val">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-layout">
            {/* INPUT FORM */}
            <div className="card">
              <div className="card-title">Academic Profile</div>
              <div className="card-sub">Fill in all fields to generate your prediction</div>

              <div className="fields-grid">
                {/* GRE */}
                <div className="field-group">
                  <label className="field-label">
                    GRE Score
                    <span className="field-range">260 – 340</span>
                  </label>
                  <div className="field-input-wrap">
                    <input
                      type="number"
                      className="field-input"
                      value={values.gre}
                      min={260} max={340}
                      onChange={e => setValues(v => ({ ...v, gre: +e.target.value }))}
                      placeholder="e.g. 320"
                    />
                  </div>
                  <div className="slider-wrap">
                    <input type="range" className="range-slider"
                      min={260} max={340} value={values.gre}
                      onChange={e => setValues(v => ({ ...v, gre: +e.target.value }))}
                      style={{ background: `linear-gradient(to right, var(--accent) ${((values.gre-260)/80)*100}%, var(--surface2) ${((values.gre-260)/80)*100}%)` }}
                    />
                    <div className="range-ticks"><span className="range-tick">260</span><span className="range-tick">340</span></div>
                  </div>
                </div>

                {/* TOEFL */}
                <div className="field-group">
                  <label className="field-label">
                    TOEFL Score
                    <span className="field-range">0 – 120</span>
                  </label>
                  <input
                    type="number"
                    className="field-input"
                    value={values.toefl}
                    min={0} max={120}
                    onChange={e => setValues(v => ({ ...v, toefl: +e.target.value }))}
                    placeholder="e.g. 105"
                  />
                  <div className="slider-wrap">
                    <input type="range" className="range-slider"
                      min={0} max={120} value={values.toefl}
                      onChange={e => setValues(v => ({ ...v, toefl: +e.target.value }))}
                      style={{ background: `linear-gradient(to right, #a78bfa ${(values.toefl/120)*100}%, var(--surface2) ${(values.toefl/120)*100}%)` }}
                    />
                    <div className="range-ticks"><span className="range-tick">0</span><span className="range-tick">120</span></div>
                  </div>
                </div>

                {/* CGPA */}
                <div className="field-group">
                  <label className="field-label">
                    CGPA
                    <span className="field-range">0 – 10</span>
                  </label>
                  <input
                    type="number"
                    className="field-input"
                    value={values.cgpa}
                    min={0} max={10} step={0.01}
                    onChange={e => setValues(v => ({ ...v, cgpa: +e.target.value }))}
                    placeholder="e.g. 8.76"
                  />
                  <div className="slider-wrap">
                    <input type="range" className="range-slider"
                      min={0} max={10} step={0.01} value={values.cgpa}
                      onChange={e => setValues(v => ({ ...v, cgpa: +e.target.value }))}
                      style={{ background: `linear-gradient(to right, #48d597 ${(values.cgpa/10)*100}%, var(--surface2) ${(values.cgpa/10)*100}%)` }}
                    />
                    <div className="range-ticks"><span className="range-tick">0</span><span className="range-tick">10</span></div>
                  </div>
                </div>

                {/* University Rating */}
                <div className="field-group">
                  <label className="field-label">
                    University Rating
                    <span className="field-range">1 – 5</span>
                  </label>
                  <input
                    type="number"
                    className="field-input"
                    value={values.university_rating}
                    min={1} max={5} step={1}
                    onChange={e => setValues(v => ({ ...v, university_rating: +e.target.value }))}
                  />
                  <div className="slider-wrap">
                    <input type="range" className="range-slider"
                      min={1} max={5} step={1} value={values.university_rating}
                      onChange={e => setValues(v => ({ ...v, university_rating: +e.target.value }))}
                      style={{ background: `linear-gradient(to right, #f6c90e ${((values.university_rating-1)/4)*100}%, var(--surface2) ${((values.university_rating-1)/4)*100}%)` }}
                    />
                    <div className="range-ticks">{[1,2,3,4,5].map(n => <span className="range-tick" key={n}>{n}</span>)}</div>
                  </div>
                </div>

                {/* SOP */}
                <div className="field-group">
                  <label className="field-label">
                    SOP Strength
                    <span className="field-range">1 – 5</span>
                  </label>
                  <input
                    type="number"
                    className="field-input"
                    value={values.sop}
                    min={1} max={5} step={0.5}
                    onChange={e => setValues(v => ({ ...v, sop: +e.target.value }))}
                  />
                  <div className="slider-wrap">
                    <input type="range" className="range-slider"
                      min={1} max={5} step={0.5} value={values.sop}
                      onChange={e => setValues(v => ({ ...v, sop: +e.target.value }))}
                      style={{ background: `linear-gradient(to right, #fb923c ${((values.sop-1)/4)*100}%, var(--surface2) ${((values.sop-1)/4)*100}%)` }}
                    />
                    <div className="range-ticks"><span className="range-tick">1</span><span className="range-tick">5</span></div>
                  </div>
                </div>

                {/* LOR */}
                <div className="field-group">
                  <label className="field-label">
                    LOR Strength
                    <span className="field-range">1 – 5</span>
                  </label>
                  <input
                    type="number"
                    className="field-input"
                    value={values.lor}
                    min={1} max={5} step={0.5}
                    onChange={e => setValues(v => ({ ...v, lor: +e.target.value }))}
                  />
                  <div className="slider-wrap">
                    <input type="range" className="range-slider"
                      min={1} max={5} step={0.5} value={values.lor}
                      onChange={e => setValues(v => ({ ...v, lor: +e.target.value }))}
                      style={{ background: `linear-gradient(to right, #f472b6 ${((values.lor-1)/4)*100}%, var(--surface2) ${((values.lor-1)/4)*100}%)` }}
                    />
                    <div className="range-ticks"><span className="range-tick">1</span><span className="range-tick">5</span></div>
                  </div>
                </div>
              </div>

              {/* Research Toggle */}
              <div className="field-group" style={{ marginTop: 16 }}>
                <label className="field-label">Research Experience</label>
                <div className="toggle-wrap">
                  <button
                    className={`toggle-btn ${values.research === 0 ? "active" : ""}`}
                    onClick={() => setValues(v => ({ ...v, research: 0 }))}
                  >
                    ✕ No Research
                  </button>
                  <button
                    className={`toggle-btn ${values.research === 1 ? "active" : ""}`}
                    onClick={() => setValues(v => ({ ...v, research: 1 }))}
                  >
                    ✓ Has Research
                  </button>
                </div>
              </div>

              <button className="predict-btn" onClick={handlePredict} disabled={loading || insightsLoading}>
                {loading ? (
                  <><span className="spin">⟳</span> Running Model...</>
                ) : insightsLoading ? (
                  <><span className="spin">⟳</span> Generating Insights...</>
                ) : (
                  <><span>🔮</span> Predict Admission Chance</>
                )}
              </button>

              {error && <div className="error-msg">⚠ {error}</div>}
            </div>

            {/* RESULT PANEL */}
            <div className="result-card">
              <div className="result-header">
                <div className="result-title">Prediction Result</div>
                <div className="result-sub">{result ? "Analysis complete" : "Awaiting profile submission"}</div>
              </div>
              <div className="result-body">
                {loading && (
                  <div className="loading-dots">
                    <div className="dot" /><div className="dot" /><div className="dot" />
                  </div>
                )}

                {!loading && !result && (
                  <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <div className="empty-text">Enter your academic profile and click <strong>Predict</strong> to see your admission probability and personalized insights.</div>
                  </div>
                )}

                {!loading && result && (
                  <div className="fade-in">
                    <div className="gauge-wrap">
                      <Gauge value={result.probability} />
                    </div>

                    <div className={`verdict-wrap ${verdictClass}`}>
                      {verdictEmoji} {result.verdict} — {result.verdict_detail}
                    </div>

                    <div className="feature-importance">
                      <div className="fi-title">Profile Breakdown</div>
                      <div className="factors-list">
                        <FactorBar label="GRE Score" value={values.gre} max={340} color={barColors.gre} />
                        <FactorBar label="TOEFL Score" value={values.toefl} max={120} color={barColors.toefl} />
                        <FactorBar label="CGPA" value={values.cgpa} max={10} color={barColors.cgpa} />
                        <FactorBar label="Univ. Rating" value={values.university_rating} max={5} color={barColors.university_rating} />
                        <FactorBar label="SOP" value={values.sop} max={5} color={barColors.sop} />
                        <FactorBar label="LOR" value={values.lor} max={5} color={barColors.lor} />
                      </div>
                    </div>

                    <div className="insight-wrap">
                      <div className="insight-title">💡 AI Insight</div>
                      {insightsLoading || !result.insight ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ height: 12, borderRadius: 6, background: "var(--surface)", animation: "pulse 1.5s ease-in-out infinite", width: "100%" }} />
                          <div style={{ height: 12, borderRadius: 6, background: "var(--surface)", animation: "pulse 1.5s ease-in-out infinite", width: "85%", animationDelay: "0.2s" }} />
                          <div style={{ height: 12, borderRadius: 6, background: "var(--surface)", animation: "pulse 1.5s ease-in-out infinite", width: "70%", animationDelay: "0.4s" }} />
                        </div>
                      ) : (
                        <div className="insight-text">{result.insight}</div>
                      )}
                    </div>

                    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ background: "rgba(72,213,151,0.07)", border: "1px solid rgba(72,213,151,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ fontSize: 10, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Strongest</div>
                        {insightsLoading || !result.strongest_factor ? (
                          <div style={{ height: 13, borderRadius: 4, background: "var(--surface2)", animation: "pulse 1.5s ease-in-out infinite", width: "80%" }} />
                        ) : (
                          <div style={{ fontSize: 13, color: "var(--text)" }}>{result.strongest_factor}</div>
                        )}
                      </div>
                      <div style={{ background: "rgba(246,201,14,0.07)", border: "1px solid rgba(246,201,14,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ fontSize: 10, color: "var(--accent2)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Improve</div>
                        {insightsLoading || !result.weakest_factor ? (
                          <div style={{ height: 13, borderRadius: 4, background: "var(--surface2)", animation: "pulse 1.5s ease-in-out infinite", width: "80%" }} />
                        ) : (
                          <div style={{ fontSize: 13, color: "var(--text)" }}>{result.weakest_factor}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}