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
    content_type = (file.content_type or "").lower()
    filename = file.filename or "unknown.jpg"
    is_video = (
        content_type.startswith("video/")
        or filename.lower().endswith((".mp4", ".mov", ".avi", ".webm", ".mkv", ".m4v", ".3gp"))
    )
    is_image = (
        content_type.startswith("image/")
        or filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".bmp"))
    )

    if not (is_image or is_video):
        raise HTTPException(status_code=400, detail="Invalid media type. Please upload a road photograph or recorded video.")

    try:
        contents = await file.read()
        detector = get_detector()
        detections, provider_name, processed_frames = detector.detect(contents, filename)

        highest_conf = max([d.confidence for d in detections]) if detections else 0.0
        severities = [d.severity for d in detections]
        overall_sev = "CRITICAL" if "CRITICAL" in severities else ("HIGH" if "HIGH" in severities else "MEDIUM")

        frame_info = f"Analyzed {processed_frames} video frame(s)" if is_video else "Analyzed road photo"
        return DetectionResponse(
            success=True,
            provider=provider_name,
            message=f"{frame_info} from '{filename}'. Identified {len(detections)} defect signature(s).",
            processed_frames=processed_frames,
            detections=detections,
            overall_severity=overall_sev,
            highest_confidence=highest_conf,
            requires_immediate_action=overall_sev in ["HIGH", "CRITICAL"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Vision detection error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.API_PORT, reload=True)

