import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { ContractStatus, ProjectStatus, ReportStatus, UserRole, VerificationStatus } from '@prisma/client';

export const getDashboardOverview = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalContractors,
      pendingContractors,
      totalQRCodes,
      qrScansSum,
      totalReports,
      pendingReports,
      verifiedReports,
      repairedReports,
      rejectedReports,
      openContracts,
      awardedContracts,
      totalBids,
      activeProjects,
      completedProjects,
      detections,
      recentReports,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.USER } }),
      prisma.contractorProfile.count(),
      prisma.contractorProfile.count({ where: { status: VerificationStatus.PENDING } }),
      prisma.qRCode.count(),
      prisma.qRCode.aggregate({ _sum: { scanCount: true } }),
      prisma.damageReport.count(),
      prisma.damageReport.count({ where: { status: { in: [ReportStatus.SUBMITTED, ReportStatus.AI_PROCESSED] } } }),
      prisma.damageReport.count({ where: { status: ReportStatus.VERIFIED } }),
      prisma.damageReport.count({ where: { status: ReportStatus.REPAIRED } }),
      prisma.damageReport.count({ where: { status: ReportStatus.REJECTED } }),
      prisma.repairContract.count({ where: { status: ContractStatus.OPEN_FOR_BIDDING } }),
      prisma.repairContract.count({ where: { status: ContractStatus.AWARDED } }),
      prisma.bid.count(),
      prisma.repairProject.count({ where: { status: { in: [ProjectStatus.AWARDED, ProjectStatus.ACCEPTED, ProjectStatus.IN_PROGRESS, ProjectStatus.SUBMITTED_FOR_INSPECTION] } } }),
      prisma.repairProject.count({ where: { status: ProjectStatus.COMPLETED } }),
      prisma.damageDetection.findMany({
        select: { severity: true, damageCategory: true },
      }),
      prisma.damageReport.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { detections: true },
      }),
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { timestamp: 'desc' },
        include: { actor: { select: { fullName: true, role: true } } },
      }),
    ]);

    // Severity distribution
    const severityCount = {
      CRITICAL: detections.filter((d) => d.severity === 'CRITICAL').length,
      HIGH: detections.filter((d) => d.severity === 'HIGH').length,
      MEDIUM: detections.filter((d) => d.severity === 'MEDIUM').length,
      LOW: detections.filter((d) => d.severity === 'LOW').length,
    };

    // Category distribution
    const categoryCount: Record<string, number> = {};
    for (const d of detections) {
      categoryCount[d.damageCategory] = (categoryCount[d.damageCategory] || 0) + 1;
    }

    res.json({
      kpis: {
        totalUsers,
        totalContractors,
        pendingContractors,
        totalQRCodes,
        totalQRScans: qrScansSum._sum.scanCount || 0,
        totalReports,
        pendingReports,
        verifiedReports,
        repairedReports,
        rejectedReports,
        openContracts,
        awardedContracts,
        totalBids,
        activeProjects,
        completedProjects,
        totalDetections: detections.length,
      },
      distributions: {
        severity: severityCount,
        categories: categoryCount,
      },
      recentReports,
      recentActivities: recentAuditLogs,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMapMarkers = async (req: AuthRequest, res: Response) => {
  try {
    const [reports, contracts, contractors, qrCodes] = await Promise.all([
      prisma.damageReport.findMany({
        select: {
          id: true,
          reportNumber: true,
          title: true,
          address: true,
          latitude: true,
          longitude: true,
          damageCategory: true,
          status: true,
          detections: {
            select: { severity: true, confidence: true, estimatedDepthCm: true },
          },
        },
      }),
      prisma.repairContract.findMany({
        select: {
          id: true,
          contractNumber: true,
          title: true,
          targetLatitude: true,
          targetLongitude: true,
          eligibleRadiusKm: true,
          estimatedBudget: true,
          status: true,
        },
      }),
      prisma.contractorProfile.findMany({
        where: { status: VerificationStatus.APPROVED },
        select: {
          id: true,
          companyName: true,
          latitude: true,
          longitude: true,
          operatingRadiusKm: true,
          rating: true,
        },
      }),
      prisma.qRCode.findMany({
        where: { isActive: true },
        select: {
          id: true,
          code: true,
          locationName: true,
          latitude: true,
          longitude: true,
          scanCount: true,
        },
      }),
    ]);

    res.json({
      reports: reports.map((r) => {
        const primarySeverity = r.detections[0]?.severity || 'MEDIUM';
        return {
          id: r.id,
          reportNumber: r.reportNumber,
          title: r.title,
          address: r.address,
          latitude: r.latitude,
          longitude: r.longitude,
          damageCategory: r.damageCategory,
          status: r.status,
          severity: primarySeverity,
          depth: r.detections[0]?.estimatedDepthCm,
        };
      }),
      contracts: contracts.map((c) => ({
        id: c.id,
        contractNumber: c.contractNumber,
        title: c.title,
        latitude: c.targetLatitude,
        longitude: c.targetLongitude,
        radiusKm: c.eligibleRadiusKm,
        budget: c.estimatedBudget,
        status: c.status,
      })),
      contractors: contractors.map((con) => ({
        id: con.id,
        name: con.companyName,
        latitude: con.latitude,
        longitude: con.longitude,
        radiusKm: con.operatingRadiusKm,
        rating: con.rating,
      })),
      qrCodes: qrCodes.map((q) => ({
        id: q.id,
        code: q.code,
        name: q.locationName,
        latitude: q.latitude,
        longitude: q.longitude,
        scans: q.scanCount,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

