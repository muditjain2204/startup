import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { ProjectStatus, RepairStage, ReportStatus, UserRole } from '@prisma/client';

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status as ProjectStatus;
    }

    if (req.user?.role === UserRole.CONTRACTOR) {
      const profile = await prisma.contractorProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (profile) {
        where.contractorId = profile.id;
      }
    }

    const projects = await prisma.repairProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contract: {
          include: {
            damageReport: true,
          },
        },
        contractor: true,
        updates: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    res.json({ projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const project = await prisma.repairProject.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            damageReport: {
              include: {
                evidence: true,
                detections: true,
                reporter: true,
              },
            },
          },
        },
        contractor: {
          include: { user: true },
        },
        updates: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProjectStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, inspectionNotes } = req.body;

    const project = await prisma.repairProject.findUnique({
      where: { id },
      include: {
        contract: {
          include: { damageReport: true },
        },
        contractor: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updateData: any = { status };
    if (status === ProjectStatus.IN_PROGRESS && !project.startDate) {
      updateData.startDate = new Date();
    }
    if (status === ProjectStatus.COMPLETED) {
      updateData.completionDate = new Date();
      updateData.inspectionNotes = inspectionNotes || 'Passed quality and surface roughness standard.';
    }

    const updated = await prisma.repairProject.update({
      where: { id },
      data: updateData,
    });

    if (status === ProjectStatus.SUBMITTED_FOR_INSPECTION) {
      const admins = await prisma.user.findMany({ where: { role: UserRole.ADMIN } });
      for (const a of admins) {
        await prisma.notification.create({
          data: {
            userId: a.id,
            title: `Repair Inspection Requested: ${project.contract.contractNumber}`,
            message: `${project.contractor.companyName} completed road repairs and submitted after-photos for inspection.`,
            type: 'INSPECTION_REQUESTED',
            link: `/admin/projects/${project.id}`,
          },
        });
      }
    }

    if (status === ProjectStatus.COMPLETED) {
      await prisma.damageReport.update({
        where: { id: project.contract.damageReportId },
        data: { status: ReportStatus.REPAIRED },
      });

      if (project.contract.damageReport.reporterId) {
        await prisma.notification.create({
          data: {
            userId: project.contract.damageReport.reporterId,
            title: 'Your Reported Road Defect Has Been Repaired! 🎉',
            message: `Inspection confirmed completion for ${project.contract.damageReport.reportNumber}. Thank you for making our roads safer!`,
            type: 'REPAIR_COMPLETED',
            link: `/citizen/reports`,
          },
        });
      }

      await prisma.notification.create({
        data: {
          userId: project.contractor.userId,
          title: `Project Inspection Approved!`,
          message: `PWD Chief Engineer has approved completion for contract ${project.contract.contractNumber}. Payment release initiated.`,
          type: 'PAYMENT_APPROVED',
          link: `/contractor/projects/${project.id}`,
        },
      });
    }

    res.json({ message: 'Project status updated successfully', project: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addProjectUpdate = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { stage, notes } = req.body;

    const files = req.files as Express.Multer.File[];
    const singleFile = req.file as Express.Multer.File;
    const uploadedFiles = files || (singleFile ? [singleFile] : []);

    const photoUrls = uploadedFiles.map((f) => `/uploads/updates/${f.filename}`);

    if (photoUrls.length === 0 && req.body.photoUrl) {
      photoUrls.push(req.body.photoUrl);
    } else if (photoUrls.length === 0) {
      photoUrls.push('https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80');
    }

    const update = await prisma.repairUpdate.create({
      data: {
        projectId: id,
        stage: (stage as RepairStage) || RepairStage.IN_PROGRESS,
        notes: notes || 'Work progress recorded with photographic evidence.',
        photoUrls: JSON.stringify(photoUrls),
      },
    });

    res.status(201).json({ message: 'Project progress update recorded!', update });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
