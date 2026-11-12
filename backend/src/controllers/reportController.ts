import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { analyzeRoadMedia } from '../services/aiClient';
import { checkPotentialDuplicates } from '../services/duplicateService';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { DamageCategory, ReportStatus, SeverityLevel, UserRole } from '@prisma/client';

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      latitude,
      longitude,
      address,
      city = 'Delhi NCR',
      qrCode,
      damageCategory = 'POTHOLE',
    } = req.body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid GPS latitude and longitude are required' });
    }

    let qrRecord = null;
    if (qrCode) {
      qrRecord = await prisma.qRCode.findUnique({ where: { code: qrCode } });
      if (qrRecord) {
        await prisma.qRCode.update({
          where: { id: qrRecord.id },
          data: { scanCount: { increment: 1 } },
        });
      }
    }

    const count = await prisma.damageReport.count();
    const reportNumber = `SR-2026-${(count + 1).toString().padStart(4, '0')}`;

    const report = await prisma.damageReport.create({
      data: {
        reportNumber,
        reporterId: req.user?.id || null,
        qrCodeId: qrRecord?.id || null,
        title: title || `Road Damage near ${address || 'Delhi Area'}`,
        description: description || 'Citizen reported road defect.',
        latitude: lat,
        longitude: lng,
        address: address || 'New Delhi, India',
        city,
        damageCategory: (damageCategory as DamageCategory) || DamageCategory.POTHOLE,
        status: ReportStatus.SUBMITTED,
      },
    });

    let aiDetectionResult = null;
    const files = req.files as Express.Multer.File[];
    const singleFile = req.file as Express.Multer.File;
    const uploadedFiles = files || (singleFile ? [singleFile] : []);

    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const f of uploadedFiles) {
        const isVideo =
          f.mimetype.startsWith('video/') ||
          /\.(mp4|mov|webm|avi|m4v|3gp|mkv)$/i.test(f.originalname) ||
          /\.(mp4|mov|webm|avi|m4v|3gp|mkv)$/i.test(f.filename);

        let mediaUrl = `/uploads/evidence/${f.filename}`;

        // Upload to Cloudinary if credentials are configured
        const cloudUrl = await uploadToCloudinary(f.path, 'smartroad_evidence');
        if (cloudUrl) {
          mediaUrl = cloudUrl;
        }

        if (!aiDetectionResult) {
          aiDetectionResult = await analyzeRoadMedia(f.path, lat, lng);
        }

        const thumbnail =
          isVideo && aiDetectionResult?.detections?.[0]?.annotated_image_base64
            ? aiDetectionResult.detections[0].annotated_image_base64
            : mediaUrl;

        await prisma.damageEvidence.create({
          data: {
            reportId: report.id,
            mediaType: isVideo ? 'VIDEO' : 'IMAGE',
            mediaUrl,
            thumbnailUrl: thumbnail,
            fileSize: f.size,
            mimeType: f.mimetype || (isVideo ? 'video/mp4' : 'image/jpeg'),
            gpsLat: lat,
            gpsLng: lng,
          },
        });
      }
    }

    if (aiDetectionResult && aiDetectionResult.detections.length > 0) {
      for (const det of aiDetectionResult.detections) {
        await prisma.damageDetection.create({
          data: {
            reportId: report.id,
            damageCategory: det.damage_category,
            confidence: det.confidence,
            severity: det.severity as SeverityLevel,
            estimatedAreaSqM: det.estimated_area_sq_m,
            estimatedDepthCm: det.estimated_depth_cm,
            boundingBoxJson: JSON.stringify(det.bounding_box),
            annotatedImageUrl: det.annotated_image_base64 || null,
          },
        });
      }

      await prisma.damageReport.update({
        where: { id: report.id },
        data: { status: ReportStatus.AI_PROCESSED },
      });
    }

    const duplicateCandidates = await checkPotentialDuplicates(lat, lng, report.id);

    const admins = await prisma.user.findMany({ where: { role: UserRole.ADMIN } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: `New Damage Report: ${report.reportNumber}`,
          message: `${report.damageCategory} detected near ${address || city}. AI Severity: ${aiDetectionResult?.overall_severity || 'MEDIUM'}`,
          type: 'DAMAGE_REPORTED',
          link: `/admin/reports/${report.id}`,
        },
      });
    }

    if (req.user) {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: 'Report Received & AI Scanned',
          message: `Your report ${report.reportNumber} has been received and verified by AI. Status: Pending PWD approval.`,
          type: 'REPORT_SUBMITTED',
          link: `/citizen/reports`,
        },
      });
    }

    const fullReport = await prisma.damageReport.findUnique({
      where: { id: report.id },
      include: {
        detections: true,
        evidence: true,
      },
    });

    res.status(201).json({
      message: 'Damage report submitted and AI processed successfully!',
      report: fullReport,
      duplicateCandidatesCount: duplicateCandidates.length,
      duplicateCandidates,
      aiAnalysis: aiDetectionResult,
    });
  } catch (error: any) {
    console.error('Report submission error:', error);
    res.status(500).json({ error: error.message || 'Error processing damage report' });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const {
      status,
      damageCategory,
      city,
      search,
      page = '1',
      limit = '20',
      myReportsOnly = 'false',
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (myReportsOnly === 'true' && req.user) {
      where.reporterId = req.user.id;
    }

    if (status && status !== 'ALL') {
      where.status = status as ReportStatus;
    }

    if (damageCategory && damageCategory !== 'ALL') {
      where.damageCategory = damageCategory as DamageCategory;
    }

    if (city && city !== 'ALL') {
      where.city = { contains: city as string, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { reportNumber: { contains: search as string, mode: 'insensitive' } },
        { title: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [reports, total] = await Promise.all([
      prisma.damageReport.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          detections: true,
          evidence: true,
          repairContract: {
            select: { id: true, contractNumber: true, status: true },
          },
          _count: {
            select: { duplicates: true },
          },
        },
      }),
      prisma.damageReport.count({ where }),
    ]);

    res.json({
      reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReportById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const report = await prisma.damageReport.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        qrCode: true,
        detections: true,
        evidence: true,
        repairContract: {
          include: {
            bids: {
              include: {
                contractor: true,
              },
            },
            repairProject: {
              include: {
                updates: true,
                contractor: true,
              },
            },
          },
        },
        duplicates: true,
        duplicateOf: true,
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const duplicateCandidates = await checkPotentialDuplicates(report.latitude, report.longitude, report.id);

    res.json({
      report,
      duplicateCandidates,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyReport = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, adminNotes, damageCategory } = req.body;

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either VERIFIED or REJECTED' });
    }

    const report = await prisma.damageReport.update({
      where: { id },
      data: {
        status: status as ReportStatus,
        adminNotes: adminNotes || undefined,
        damageCategory: damageCategory ? (damageCategory as DamageCategory) : undefined,
      },
      include: { reporter: true },
    });

    if (report.reporterId) {
      await prisma.notification.create({
        data: {
          userId: report.reporterId,
          title: `Report ${report.reportNumber} ${status === 'VERIFIED' ? 'Approved' : 'Rejected'}`,
          message: status === 'VERIFIED'
            ? `PWD engineer has verified and scheduled your report for repair contracting.`
            : `Your report was reviewed and marked as: ${adminNotes || 'Does not meet defect criteria'}.`,
          type: 'REPORT_STATUS',
          link: `/citizen/reports`,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: req.user?.id,
        action: `REPORT_${status}`,
        entityType: 'DamageReport',
        entityId: report.id,
        details: adminNotes || `Report ${status.toLowerCase()} by admin`,
      },
    });

    res.json({
      message: `Report successfully marked as ${status}`,
      report,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const mergeReports = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { duplicateReportId } = req.body;

    if (!duplicateReportId || duplicateReportId === id) {
      return res.status(400).json({ error: 'Valid duplicateReportId required' });
    }

    const merged = await prisma.damageReport.update({
      where: { id: duplicateReportId as string },
      data: {
        duplicateOfId: id,
        adminNotes: `Merged into primary report ${id} as duplicate damage occurrence.`,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user?.id,
        action: 'MERGE_DUPLICATE_REPORT',
        entityType: 'DamageReport',
        entityId: id,
        details: `Merged report ${merged.reportNumber} into primary report.`,
      },
    });

    res.json({
      message: `Duplicate report ${merged.reportNumber} merged successfully into primary report.`,
      merged,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
