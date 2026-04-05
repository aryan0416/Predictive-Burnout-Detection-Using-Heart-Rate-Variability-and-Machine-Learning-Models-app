import os
import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI(title="Burnout & Stress Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scaler = None
model = None

@app.on_event("startup")
def load_assets():
    global scaler, model
    try:
        if os.path.exists("scaler.pkl"):
            scaler = joblib.load("scaler.pkl")
        else:
            print("Warning: scaler.pkl not found!")
            
        if os.path.exists("rf_model.pkl"):
            model = joblib.load("rf_model.pkl")
        else:
            print("Warning: rf_model.pkl not found!")
    except Exception as e:
        print(f"Failed to load model or scaler: {e}")

class HRVInput(BaseModel):
    HRV_RMSSD: float
    HRV_MeanNN: float
    HRV_SDNN: float
    HRV_LF: float
    HRV_HF: float
    HRV_LFHF: float

@app.post("/predict")
def predict(data: HRVInput):
    if scaler is None or model is None:
        return {"error": "Model or scaler not loaded. Please train the model first."}
    
    features = np.array([[
        data.HRV_RMSSD,
        data.HRV_MeanNN,
        data.HRV_SDNN,
        data.HRV_LF,
        data.HRV_HF,
        data.HRV_LFHF
    ]])
    
    scaled_features = scaler.transform(features)
    
    prediction = model.predict(scaled_features)[0]
    prob = model.predict_proba(scaled_features)[0]
    
    confidence = float(prob[1] if prediction == 1 else prob[0])
    status = "Stress / Burnout Risk" if prediction == 1 else "Baseline (Optimal)"
    
    return {
        "prediction": int(prediction),
        "status": status,
        "confidence": confidence
    }

class GrokRequest(BaseModel):
    status: str
    confidence: float
    metrics: dict

@app.post("/grok-analysis")
def get_grok_analysis(req: GrokRequest):
    api_key = os.getenv("GROK_API_KEY")
    if not api_key:
        return {"error": "API KEY missing."}
        
    prompt = f"""
    The user has taken an HRV test for burnout prediction.
    Their prediction is: {req.status} with {req.confidence*100:.1f}% confidence.
    Their metrics are:
    - RMSSD: {req.metrics.get('HRV_RMSSD')} ms
    - Mean NN: {req.metrics.get('HRV_MeanNN')} ms
    - SDNN: {req.metrics.get('HRV_SDNN')} ms
    - LF Power: {req.metrics.get('HRV_LF')}
    - HF Power: {req.metrics.get('HRV_HF')}
    - LF/HF Ratio: {req.metrics.get('HRV_LFHF')}
    
    Please provide a concise, clinical yet encouraging 3-sentence analysis of what these specific numeric readings indicate about their autonomic nervous system balance and burnout trajectory.
    """
    
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {"role": "system", "content": "You are a clinical wellness expert analyzing HRV data. You speak clearly and concisely."},
                    {"role": "user", "content": prompt}
                ]
            }
        )
        response.raise_for_status()
        result = response.json()
        analysis = result['choices'][0]['message']['content']
        return {"analysis": analysis}
    except Exception as e:
        return {"error": f"Failed to get AI analysis: {str(e)}"}
