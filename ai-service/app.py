from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(title="AI Service", version="0.1.0")

class PredictRequest(BaseModel):
    items: list[str]
    horizon: int = 7

class AnomalyRequest(BaseModel):
    candidate_ids: list[str]

@app.get("/health")
def health():
    return {"ok": True, "service": "ai"}

@app.post("/predict")
def predict(req: PredictRequest):
    results = {}
    for item in req.items:
        base = random.randint(50, 200)
        results[item] = [max(0, int(base * (0.9 ** i))) for i in range(req.horizon)]
    return {"predictions": results}

@app.post("/anomaly")
def detect(req: AnomalyRequest):
    anomalies = []
    for cid in req.candidate_ids:
        score = round(random.random(), 3)
        anomalies.append({"id": cid, "score": score, "suspicious": score > 0.85})
    return {"anomalies": anomalies}
