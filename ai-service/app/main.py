import uvicorn
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from app.schemas import DetectionResponse
from app.detector import get_detector
from app.config import settings

app = FastAPI(
    title=settings.SERVICE_NAME,
    description="Microservice for Road Damage Detection, Depth/Area Estimation, and Visual Bounding Boxes",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "provider": settings.PROVIDER_TYPE,
    }

@app.get("/api/thresholds")
def get_thresholds():
    return {
        "min_confidence": settings.DEFAULT_CONFIDENCE_THRESHOLD,
        "min_pothole_area_sq_m": settings.MIN_POTHOLE_AREA_SQ_M,
        "min_depth_cm": settings.MIN_ESTIMATED_DEPTH_CM,
        "critical_depth_cm": settings.CRITICAL_DEPTH_CM,
    }

@app.post("/api/detect", response_model=DetectionResponse)
async def detect_damage(
    file: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
):
    """
    Receives an image/video file, processes road surface characteristics,
    and returns detected potholes, cracks, or surface breaks with estimated severity.
    """
    content_type = file.content_type or ""
    filename = file.filename or "unknown.jpg"

    if not (content_type.startswith("image/") or content_type.startswith("video/") or filename.endswith((".jpg", ".jpeg", ".png", ".mp4", ".mov"))):
        raise HTTPException(status_code=400, detail="Invalid media type. Please upload a road photo or video.")

    try:
        contents = await file.read()
        detector = get_detector()
        detections, provider_name = detector.detect(contents, filename)

        highest_conf = max([d.confidence for d in detections]) if detections else 0.0
        severities = [d.severity for d in detections]
        overall_sev = "CRITICAL" if "CRITICAL" in severities else ("HIGH" if "HIGH" in severities else "MEDIUM")

        return DetectionResponse(
            success=True,
            provider=provider_name,
            message=f"Processed road media '{filename}'. Found {len(detections)} defect signature(s).",
            processed_frames=1,
            detections=detections,
            overall_severity=overall_sev,
            highest_confidence=highest_conf,
            requires_immediate_action=overall_sev in ["HIGH", "CRITICAL"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Vision detection error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.API_PORT, reload=True)

