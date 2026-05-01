"""
train_model.py
--------------
Downloads the Admission Chance dataset, trains a Linear Regression model,
evaluates it, and saves the trained model + scaler to disk.

Run once before starting the API:
    python train_model.py
"""

import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# ─── 1. Load Dataset ──────────────────────────────────────────────────────────
print("📦 Loading dataset...")
url = "https://github.com/ybifoundation/Dataset/raw/main/Admission%20Chance.csv"

df = pd.read_csv(url)
df.columns = df.columns.str.strip()

print(f"   ✓ Loaded {len(df)} rows, {df.shape[1]} columns")
print(f"   Columns: {list(df.columns)}\n")

# ─── 2. Prepare Features ─────────────────────────────────────────────────────
FEATURES = ["GRE Score", "TOEFL Score", "University Rating", "SOP", "LOR", "CGPA", "Research"]
TARGET   = "Chance of Admit"

# Drop Serial No if present
if "Serial No" in df.columns:
    df.drop("Serial No", axis=1, inplace=True)

X = df[FEATURES]
y = df[TARGET]

print("🎯 Features:", FEATURES)
print(f"   Target  : {TARGET}\n")

# ─── 3. Train / Test Split ───────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, train_size=0.7, random_state=2529
)
print(f"✂️  Train size : {X_train.shape[0]}  |  Test size: {X_test.shape[0]}\n")

# ─── 4. Scale Features ───────────────────────────────────────────────────────
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

# ─── 5. Train Model ──────────────────────────────────────────────────────────
print("🤖 Training Linear Regression model...")
model = LinearRegression()
model.fit(X_train_scaled, y_train)
print("   ✓ Training complete!\n")

# ─── 6. Evaluate ─────────────────────────────────────────────────────────────
y_pred = model.predict(X_test_scaled)

mae  = mean_absolute_error(y_test, y_pred)
mse  = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2   = r2_score(y_test, y_pred)

print("📊 Model Evaluation Metrics:")
print(f"   MAE  : {mae:.4f}")
print(f"   MSE  : {mse:.4f}")
print(f"   RMSE : {rmse:.4f}")
print(f"   R²   : {r2:.4f}\n")

# ─── 7. Feature Importance ───────────────────────────────────────────────────
coef_series = pd.Series(model.coef_, index=FEATURES).sort_values(ascending=False)
print("🔥 Feature Importance (by coefficient):")
for feat, coef in coef_series.items():
    bar = "█" * int(abs(coef) * 200)
    sign = "+" if coef > 0 else "-"
    print(f"   {sign} {feat:<22} {coef:+.6f}  {bar}")

# ─── 8. Save Artifacts ───────────────────────────────────────────────────────
os.makedirs("model", exist_ok=True)

with open("model/admission_model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("model/scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

# Save metadata for the API to read
import json
metadata = {
    "features": FEATURES,
    "target": TARGET,
    "metrics": {
        "mae": round(mae, 4),
        "mse": round(mse, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
    },
    "coefficients": {feat: round(float(coef), 6) for feat, coef in zip(FEATURES, model.coef_)},
    "intercept": round(float(model.intercept_), 6),
    "train_size": int(X_train.shape[0]),
    "test_size": int(X_test.shape[0]),
}
with open("model/metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("\n✅ Saved:")
print("   model/admission_model.pkl")
print("   model/scaler.pkl")
print("   model/metadata.json")
print("\n🚀 Ready to start the API: uvicorn main:app --reload")