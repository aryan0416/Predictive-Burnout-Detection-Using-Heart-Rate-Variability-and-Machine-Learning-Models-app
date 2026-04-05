# Burnout & Stress Prediction Application

This is a full-stack integrated Machine Learning web application for predicting burnout and stress using Heart Rate Variability (HRV) metrics.

## Project Structure
- `frontend/`: React application (Vite + TailwindCSS)
- `backend/`: FastAPI server and XGBoost model training logic
- `notebooks/`: Original exploratory data analysis and Jupyter notebooks
- `docs/`: Prototype files and raw designs

## Prerequisites
- Python 3.10+
- Node.js & npm

## 1. Train the ML Model
Before running the backend, you must train the XGBoost model and fit the StandardScaler.

```bash
# Navigate to the backend directory:
cd backend
pip install -r requirements.txt
python train_model.py
```
*(If you have the actual WESAD dataset, you can run `python train_model.py --wesad_path /path/to/WESAD` instead. See `train_model.py` for details.)*

This will generate `xgb_model.json` and `scaler.pkl` within the `backend` directory.

## 2. Start the Backend API
Start the FastAPI server. It will load the trained model and expose the `/predict` and `/grok-analysis` endpoints.

```bash
# Ensure you are still in the backend directory:
# (Optional) Set your Groq API key for AI Coaching:
# $env:GROK_API_KEY="gsk_..."
python -m uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

## 3. Run the React Frontend
Now, start the Ethereal Clinical dashboard.

```bash
# In a new terminal, navigate to the frontend directory:
cd frontend
npm run dev
```

Navigate to the provided localhost URL (e.g., `http://localhost:5173/`) in your browser to view the interface!
