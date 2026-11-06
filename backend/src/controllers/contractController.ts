import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { ContractStatus, BidStatus, ProjectStatus, UserRole, ReportStatus, VerificationStatus } from '@prisma/client';
import { calculateDistanceKm, findEligibleContractors } from '../services/geoService';

export const createContract = async (req: AuthRequest, res: Response) => {
  try {
    const {
      damageReportId,
      title,
      description,
      repairRequirements,
      estimatedBudget,
      eligibleRadiusKm = 25.0,
      biddingDeadlineDays = 5,
    } = req.body;

    if (!damageReportId || !title || !estimatedBudget) {
      return res.status(400).json({ error: 'Damage report ID, title, and estimated budget are required' });
    }

    const report = await prisma.damageReport.findUnique({
      where: { id: damageReportId as string },
    });

    if (!report) {
      return res.status(404).json({ error: 'Damage report not found' });
    }

    // Check if contract already exists for this report
    const existing = await prisma.repairContract.findUnique({
      where: { damageReportId: damageReportId as string },
    });

    if (existing) {
      return res.status(400).json({ error: 'A repair contract already exists for this damage report' });
    }

    const count = await prisma.repairContract.count();
    const contractNumber = `RC-2026-${(count + 1).toString().padStart(4, '0')}`;
    const deadline = new Date(Date.now() + parseInt(biddingDeadlineDays, 10) * 24 * 60 * 60 * 1000);

    const contract = await prisma.repairContract.create({
      data: {
        contractNumber,
        damageReportId: damageReportId as string,
        title,
        description: description || `Road repair for report ${report.reportNumber} at ${report.address}`,
        repairRequirements: repairRequirements || 'Standard PWD MoRTH specification repair.',
        estimatedBudget: parseFloat(estimatedBudget),
        targetLatitude: report.latitude,
        targetLongitude: report.longitude,
        eligibleRadiusKm: parseFloat(eligibleRadiusKm),
        biddingDeadline: deadline,
        status: ContractStatus.OPEN_FOR_BIDDING,
      },
      include: {
        damageReport: true,
      },
    });

    // Update report status to CONTRACTED
    await prisma.damageReport.update({
      where: { id: damageReportId as string },
      data: { status: ReportStatus.CONTRACTED },
    });

    // Find and notify eligible contractors
    const eligible = await findEligibleContractors(contract.targetLatitude, contract.targetLongitude, contract.eligibleRadiusKm);
    for (const contractor of eligible) {
      await prisma.notification.create({
        data: {
          userId: contractor.userId,
          title: `New Tender Open: ${contract.contractNumber}`,
          message: `${contract.title} (Budget: ₹${contract.estimatedBudget.toLocaleString('en-IN')}) is within your operating range (${contractor.distanceKm} km away).`,
          type: 'CONTRACT_AVAILABLE',
          link: `/contractor/contracts/${contract.id}`,
        },
      });
    }

    // Log action
    await prisma.auditLog.create({
      data: {
        actorId: req.user?.id,
        action: 'CREATE_REPAIR_CONTRACT',
        entityType: 'RepairContract',
        entityId: contract.id,
        details: `Created contract ${contract.contractNumber} with budget ₹${contract.estimatedBudget}. ${eligible.length} contractors eligible.`,
      },
    });

    res.status(201).json({
      message: 'Repair contract created and published to eligible contractors!',
      contract,
      eligibleContractorsCount: eligible.length,
      eligibleContractors: eligible.map((c) => ({
        id: c.id,
        companyName: c.companyName,
        distanceKm: c.distanceKm,
        rating: c.rating,
      })),
    });
  } catch (error: any) {
    console.error('Contract creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getContracts = async (req: AuthRequest, res: Response) => {
  try {
    const { status, eligibleOnly = 'false' } = req.query;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const contracts = await prisma.repairContract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        damageReport: {
          include: {
            evidence: true,
            detections: true,
          },
        },
        bids: {
          include: {
            contractor: true,
          },
        },
        repairProject: true,
      },
    });

    let contractorProfile: any = null;
    if (req.user?.role === UserRole.CONTRACTOR) {
      contractorProfile = await prisma.contractorProfile.findUnique({
        where: { userId: req.user.id },
      });
    }

    const enhanced = contracts.map((c) => {
      let distanceKm = null;
      let isEligible = false;

      if (contractorProfile) {
        distanceKm = calculateDistanceKm(
          contractorProfile.latitude,
          contractorProfile.longitude,
          c.targetLatitude,
          c.targetLongitude
        );
        isEligible =
          contractorProfile.status === VerificationStatus.APPROVED &&
          distanceKm <= contractorProfile.operatingRadiusKm &&
          distanceKm <= c.eligibleRadiusKm;
      }

      const isContractorViewing = req.user?.role === UserRole.CONTRACTOR;
      const sanitizedBids = isContractorViewing
        ? c.bids.map((b) => ({
            id: b.id,
            contractorId: b.contractorId,
            status: b.status,
            isMyBid: b.contractorId === contractorProfile?.id,
            amount: b.contractorId === contractorProfile?.id ? b.amount : undefined,
            submittedAt: b.submittedAt,
          }))
        : c.bids;

      return {
        ...c,
        contractorDistanceKm: distanceKm,
        isEligibleForCurrentContractor: isEligible,
        bidsCount: c.bids.length,
        bids: sanitizedBids,
      };
    });

    const filtered =
      eligibleOnly === 'true' && contractorProfile
        ? enhanced.filter((c) => c.isEligibleForCurrentContractor)
        : enhanced;

    res.json({ contracts: filtered });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getContractById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const contract = await prisma.repairContract.findUnique({
      where: { id },
      include: {
        damageReport: {
          include: {
            evidence: true,
            detections: true,
            reporter: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        bids: {
          include: {
            contractor: true,
          },
          orderBy: { amount: 'asc' },
        },
        repairProject: {
          include: {
            updates: {
              orderBy: { uploadedAt: 'desc' },
            },
            contractor: true,
          },
        },
      },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    let contractorProfile = null;
    let distanceKm = null;
    let isEligible = false;

    if (req.user?.role === UserRole.CONTRACTOR) {
      contractorProfile = await prisma.contractorProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (contractorProfile) {
        distanceKm = calculateDistanceKm(
          contractorProfile.latitude,
          contractorProfile.longitude,
          contract.targetLatitude,
          contract.targetLongitude
        );
        isEligible =
          contractorProfile.status === VerificationStatus.APPROVED &&
          distanceKm <= contractorProfile.operatingRadiusKm &&
          distanceKm <= contract.eligibleRadiusKm;
      }
    }

    const isContractor = req.user?.role === UserRole.CONTRACTOR;
    const sanitizedBids = isContractor
      ? contract.bids.map((b: any) => ({
          ...b,
          amount: b.contractorId === contractorProfile?.id ? b.amount : 0,
          isMyBid: b.contractorId === contractorProfile?.id,
        }))
      : contract.bids;

    const recommendedBidId = contract.bids.length > 0 ? contract.bids[0].id : null;

    res.json({
      contract: {
        ...contract,
        bids: sanitizedBids,
        recommendedBidId,
        contractorDistanceKm: distanceKm,
        isEligible,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const submitBid = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { amount, estimatedDays, proposalDetails } = req.body;

    if (!req.user || req.user.role !== UserRole.CONTRACTOR) {
      return res.status(403).json({ error: 'Only registered contractors can submit bids' });
    }

    const profile = await prisma.contractorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Contractor profile not found' });
    }

    if (profile.status !== VerificationStatus.APPROVED) {
      return res.status(403).json({ error: 'Your contractor account is pending verification. Only approved contractors can bid.' });
    }

    const contract = await prisma.repairContract.findUnique({
      where: { id },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    if (contract.status !== ContractStatus.OPEN_FOR_BIDDING) {
      return res.status(400).json({ error: 'This contract is no longer open for bidding' });
    }

    if (new Date() > new Date(contract.biddingDeadline)) {
      return res.status(400).json({ error: 'Bidding deadline for this contract has passed' });
    }

    const distanceKm = calculateDistanceKm(
      profile.latitude,
      profile.longitude,
      contract.targetLatitude,
      contract.targetLongitude
    );

    if (distanceKm > profile.operatingRadiusKm || distanceKm > contract.eligibleRadiusKm) {
      return res.status(400).json({
        error: `Your registered depot is ${distanceKm} km away, exceeding the maximum eligible radius (${contract.eligibleRadiusKm} km).`,
      });
    }

    const bid = await prisma.bid.upsert({
      where: {
        contractId_contractorId: {
          contractId: id,
          contractorId: profile.id,
        },
      },
      update: {
        amount: parseFloat(amount),
        estimatedDays: parseInt(estimatedDays, 10),
        proposalDetails: proposalDetails || null,
        status: BidStatus.SUBMITTED,
        updatedAt: new Date(),
      },
      create: {
        contractId: id,
        contractorId: profile.id,
        amount: parseFloat(amount),
        estimatedDays: parseInt(estimatedDays, 10),
        proposalDetails: proposalDetails || null,
        status: BidStatus.SUBMITTED,
      },
    });

    const admins = await prisma.user.findMany({ where: { role: UserRole.ADMIN } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: `New Bid Submitted: ${contract.contractNumber}`,
          message: `${profile.companyName} submitted a bid of ₹${bid.amount.toLocaleString('en-IN')} (${bid.estimatedDays} days).`,
          type: 'BID_SUBMITTED',
          link: `/admin/contracts/${contract.id}`,
        },
      });
    }

    res.status(201).json({
      message: 'Bid submitted successfully!',
      bid,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const awardContract = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { bidId } = req.body;

    if (!bidId) {
      return res.status(400).json({ error: 'Bid ID is required to award contract' });
    }

    const contract = await prisma.repairContract.findUnique({
      where: { id },
      include: {
        bids: {
          include: {
            contractor: {
              include: { user: true },
            },
          },
        },
        damageReport: true,
      },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const winningBid = contract.bids.find((b: any) => b.id === bidId);
    if (!winningBid) {
      return res.status(404).json({ error: 'Specified bid does not exist on this contract' });
    }

    await prisma.bid.update({
      where: { id: winningBid.id },
      data: { status: BidStatus.ACCEPTED },
    });

    await prisma.bid.updateMany({
      where: {
        contractId: id,
        id: { not: winningBid.id },
      },
      data: { status: BidStatus.REJECTED },
    });

    const updatedContract = await prisma.repairContract.update({
      where: { id },
      data: {
        status: ContractStatus.AWARDED,
        awardedBidId: winningBid.id,
      },
    });

    const project = await prisma.repairProject.create({
      data: {
        contractId: id,
        contractorId: winningBid.contractorId,
        status: ProjectStatus.AWARDED,
      },
    });

    await prisma.notification.create({
      data: {
        userId: winningBid.contractor.userId,
        title: `Tender Awarded! Contract ${contract.contractNumber}`,
        message: `Congratulations! Your bid of ₹${winningBid.amount.toLocaleString('en-IN')} for "${contract.title}" has been accepted. Please commence repair execution.`,
        type: 'CONTRACT_AWARDED',
        link: `/contractor/projects/${project.id}`,
      },
    });

    for (const b of contract.bids) {
      if (b.id !== winningBid.id) {
        await prisma.notification.create({
          data: {
            userId: b.contractor.userId,
            title: `Bidding Concluded: ${contract.contractNumber}`,
            message: `Contract "${contract.title}" has been awarded. Thank you for participating.`,
            type: 'BID_REJECTED',
            link: `/contractor/contracts`,
          },
        });
      }
    }

    if (contract.damageReport.reporterId) {
      await prisma.notification.create({
        data: {
          userId: contract.damageReport.reporterId,
          title: 'Road Repair Contract Awarded',
          message: `PWD has awarded the repair contract for your report ${contract.damageReport.reportNumber} to ${winningBid.contractor.companyName}. Work is scheduled to start immediately.`,
          type: 'REPAIR_SCHEDULED',
          link: `/citizen/reports`,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: req.user?.id,
        action: 'AWARD_CONTRACT',
        entityType: 'RepairContract',
        entityId: contract.id,
        details: `Awarded to ${winningBid.contractor.companyName} at ₹${winningBid.amount} for ${winningBid.estimatedDays} days.`,
      },
    });

    res.json({
      message: `Contract ${contract.contractNumber} awarded to ${winningBid.contractor.companyName}!`,
      contract: updatedContract,
      project,
    });
  } catch (error: any) {
    console.error('Award error:', error);
    res.status(500).json({ error: error.message });
  }
};
