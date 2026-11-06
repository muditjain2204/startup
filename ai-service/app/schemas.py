from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum

class DamageCategory(str, Enum):
    POTHOLE = "POTHOLE"
    ALLIGATOR_CRACK = "ALLIGATOR_CRACK"
    SURFACE_BREAK = "SURFACE_BREAK"
    RUTTING = "RUTTING"
    EROSION = "EROSION"
    OTHER = "OTHER"

class SeverityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "HIGH" # In standard enum, values LOW, MEDIUM, HIGH, CRITICAL
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class BoundingBox(BaseModel):
    ymin: float = Field(..., ge=0.0, le=1.0)
    xmin: float = Field(..., ge=0.0, le=1.0)
    ymax: float = Field(..., ge=0.0, le=1.0)
    xmax: float = Field(..., ge=0.0, le=1.0)
    label: str
    confidence: float

class DetectionResultItem(BaseModel):
    damage_category: str
    confidence: float
    severity: str
    estimated_area_sq_m: float
    estimated_depth_cm: float
    bounding_box: BoundingBox
    evidence_frame_timestamp: Optional[float] = 0.0
    annotated_image_base64: Optional[str] = None

class DetectionResponse(BaseModel):
    success: bool
    provider: str
    message: str
    processed_frames: int
    detections: List[DetectionResultItem]
    overall_severity: str
    highest_confidence: float
    requires_immediate_action: bool
