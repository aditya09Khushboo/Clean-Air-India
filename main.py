from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

app = FastAPI(title="VayuNet AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

hotspots = [
    {"id":"HS-001","lat":25.5941,"lng":85.1376,"risk":91,"type":"Industrial emission","area":"Patna Industrial Corridor"},
    {"id":"HS-002","lat":25.6100,"lng":85.1200,"risk":78,"type":"Open burning","area":"North Patna"},
    {"id":"HS-003","lat":25.5750,"lng":85.1550,"risk":69,"type":"Dust","area":"East Corridor"},
    {"id":"HS-004","lat":25.6250,"lng":85.1050,"risk":84,"type":"Smoke anomaly","area":"Urban Edge"},
]

@app.get("/api/health")
def health():
    return {"status":"ok","service":"VayuNet AI"}

@app.get("/api/air-quality")
def air_quality():
    return {
        "city":"Patna",
        "aqi":142,
        "pm25":76.4,
        "pm10":119.2,
        "status":"Poor",
        "updated_at":datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/hotspots")
def get_hotspots():
    return {"hotspots":hotspots}

@app.get("/api/predictions")
def predictions():
    return {
        "current_aqi":142,
        "forecast":[
            {"hours":0,"aqi":142},
            {"hours":6,"aqi":167},
            {"hours":12,"aqi":189},
            {"hours":18,"aqi":205},
            {"hours":24,"aqi":221}
        ],
        "confidence":87
    }

@app.get("/api/alerts")
def alerts():
    return {"alerts":[
        {"id":"ALT-001","severity":"critical","title":"Industrial emission detected","location":"Patna Industrial Corridor","risk":91},
        {"id":"ALT-002","severity":"high","title":"Open burning anomaly","location":"North Patna","risk":78},
        {"id":"ALT-003","severity":"high","title":"AQI spike predicted in 12 hours","location":"East Corridor","risk":84},
    ]}

@app.post("/api/reports/analyze")
async def analyze_report(image: UploadFile = File(...)):
    # Demo response. Connect this endpoint to Gemini on Vertex AI in production.
    return {
        "filename": image.filename,
        "pollution_type":"Open burning",
        "severity":"HIGH",
        "confidence":94,
        "visible_smoke":True,
        "recommended_action":"Inspect source and dispatch response team",
        "message":"Gemini analysis demo completed."
    }
