import os

class Settings:
    SERVICE_NAME: str = "SmartRoad AI Computer Vision Engine"
    API_PORT: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    DEFAULT_CONFIDENCE_THRESHOLD: float = float(os.getenv("MIN_CONFIDENCE", "0.65"))
    MIN_POTHOLE_AREA_SQ_M: float = float(os.getenv("MIN_POTHOLE_AREA", "0.05"))
    MIN_ESTIMATED_DEPTH_CM: float = float(os.getenv("MIN_DEPTH_CM", "3.0"))
    CRITICAL_DEPTH_CM: float = float(os.getenv("CRITICAL_DEPTH_CM", "8.0"))
    PROVIDER_TYPE: str = os.getenv("AI_PROVIDER", "SIMULATED_CV") # "SIMULATED_CV" or "YOLO_V8"

settings = Settings()

