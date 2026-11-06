import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { VerificationStatus, UserStatus } from '@prisma/client';

export const getContractors = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status as VerificationStatus;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search as string, mode: 'insensitive' } },
        { gstNumber: { contains: search as string, mode: 'insensitive' } },
        { licenseNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const contractors = await prisma.contractorProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, phone: true, status: true },
        },
        documents: true,
        _count: {
          select: { bids: true, repairProjects: true },
        },
      },
    });

    res.json({ contractors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getContractorById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const contractor = await prisma.contractorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, phone: true, status: true },
        },
        documents: true,
        bids: {
          include: {
            contract: true,
          },
        },
        repairProjects: {
          include: {
            contract: true,
            updates: true,
          },
        },
      },
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor profile not found' });
    }

    res.json({ contractor });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateContractorStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, operatingRadiusKm } = req.body;

    if (!['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid verification status' });
    }

    const contractor = await prisma.contractorProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    const updated = await prisma.contractorProfile.update({
      where: { id },
      data: {
        status: status as VerificationStatus,
        operatingRadiusKm: operatingRadiusKm ? parseFloat(operatingRadiusKm) : undefined,
      },
    });

    const userStatus = status === 'APPROVED' ? UserStatus.ACTIVE : (status === 'SUSPENDED' ? UserStatus.SUSPENDED : UserStatus.ACTIVE);
    await prisma.user.update({
      where: { id: contractor.userId },
      data: { status: userStatus },
    });

    await prisma.notification.create({
      data: {
        userId: contractor.userId,
        title: `Contractor Registration ${status}`,
        message: status === 'APPROVED'
          ? `Your company "${contractor.companyName}" is verified! You may now bid for road repair contracts within ${updated.operatingRadiusKm}km.`
          : `Your contractor profile status has been updated to ${status}.`,
        type: 'CONTRACTOR_VERIFIED',
        link: '/contractor',
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user?.id,
        action: `CONTRACTOR_${status}`,
        entityType: 'ContractorProfile',
        entityId: id,
        details: `Contractor status set to ${status}.`,
      },
    });

    res.json({ message: `Contractor status updated to ${status}`, contractor: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
