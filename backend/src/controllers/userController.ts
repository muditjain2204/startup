import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { UserRole, UserStatus } from '@prisma/client';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, status, search } = req.query;
    const where: any = {};

    if (role && role !== 'ALL') {
      where.role = role as UserRole;
    }

    if (status && status !== 'ALL') {
      where.status = status as UserStatus;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        contractorProfile: {
          select: { companyName: true, status: true, rating: true },
        },
        _count: {
          select: { reports: true },
        },
      },
    });

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be ACTIVE, SUSPENDED, or BLOCKED' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status: status as UserStatus },
      select: { id: true, email: true, fullName: true, status: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user?.id,
        action: `USER_STATUS_${status}`,
        entityType: 'User',
        entityId: id,
        details: `User status changed to ${status}`,
      },
    });

    res.json({ message: `User status updated to ${status}`, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
