import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const getThresholds = async (req: AuthRequest, res: Response) => {
  try {
    let thresholds = await prisma.detectionThreshold.findFirst();
    if (!thresholds) {
      thresholds = await prisma.detectionThreshold.create({
        data: {
          minConfidence: 0.65,
          minPotholeAreaSqM: 0.05,
          minEstimatedDepthCm: 3.0,
          highSeverityDepthCm: 8.0,
          maxGpsAccuracyToleranceM: 30.0,
          duplicateDistanceThresholdM: 25.0,
        },
      });
    }
    res.json({ thresholds });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateThresholds = async (req: AuthRequest, res: Response) => {
  try {
    const {
      minConfidence,
      minPotholeAreaSqM,
      minEstimatedDepthCm,
      highSeverityDepthCm,
      maxGpsAccuracyToleranceM,
      duplicateDistanceThresholdM,
    } = req.body;

    let thresholds = await prisma.detectionThreshold.findFirst();

    if (thresholds) {
      thresholds = await prisma.detectionThreshold.update({
        where: { id: thresholds.id },
        data: {
          minConfidence: minConfidence !== undefined ? parseFloat(minConfidence) : undefined,
          minPotholeAreaSqM: minPotholeAreaSqM !== undefined ? parseFloat(minPotholeAreaSqM) : undefined,
          minEstimatedDepthCm: minEstimatedDepthCm !== undefined ? parseFloat(minEstimatedDepthCm) : undefined,
          highSeverityDepthCm: highSeverityDepthCm !== undefined ? parseFloat(highSeverityDepthCm) : undefined,
          maxGpsAccuracyToleranceM: maxGpsAccuracyToleranceM !== undefined ? parseFloat(maxGpsAccuracyToleranceM) : undefined,
          duplicateDistanceThresholdM: duplicateDistanceThresholdM !== undefined ? parseFloat(duplicateDistanceThresholdM) : undefined,
        },
      });
    } else {
      thresholds = await prisma.detectionThreshold.create({
        data: {
          minConfidence: parseFloat(minConfidence || 0.65),
          minPotholeAreaSqM: parseFloat(minPotholeAreaSqM || 0.05),
          minEstimatedDepthCm: parseFloat(minEstimatedDepthCm || 3.0),
          highSeverityDepthCm: parseFloat(highSeverityDepthCm || 8.0),
          maxGpsAccuracyToleranceM: parseFloat(maxGpsAccuracyToleranceM || 30.0),
          duplicateDistanceThresholdM: parseFloat(duplicateDistanceThresholdM || 25.0),
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: req.user?.id,
        action: 'UPDATE_AI_THRESHOLDS',
        entityType: 'DetectionThreshold',
        entityId: thresholds.id,
        details: `Updated AI detection parameters: confidence ${thresholds.minConfidence}, depth min ${thresholds.minEstimatedDepthCm}cm.`,
      },
    });

    res.json({ message: 'AI detection thresholds updated successfully!', thresholds });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

