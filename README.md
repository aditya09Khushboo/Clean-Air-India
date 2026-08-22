# VayuNet AI

India-focused hyper-local pollution intelligence MVP.

## Stack
- Frontend: React + Vite
- Backend: FastAPI
- AI-ready endpoint for Gemini/Vertex AI integration
- Mock realistic sensor, hotspot, forecast and alert data

## Run

### Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally http://localhost:5173.

The dashboard works immediately with realistic demo data. Replace the AI service implementation in `backend/main.py` with your Vertex AI/Gemini credentials for live multimodal analysis.
