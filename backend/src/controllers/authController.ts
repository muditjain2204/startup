import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole, UserStatus, VerificationStatus } from '@prisma/client';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'smartroad-enterprise-super-secret-jwt-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      role = 'USER',
      // Contractor specific fields
      companyName,
      gstNumber,
      licenseNumber,
      address,
      latitude,
      longitude,
      operatingRadiusKm,
      experienceYears,
      machinery,
      workforceCount,
    } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'CONTRACTOR' ? UserRole.CONTRACTOR : UserRole.USER;
    const initialStatus = assignedRole === UserRole.CONTRACTOR ? UserStatus.PENDING_APPROVAL : UserStatus.ACTIVE;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        role: assignedRole,
        status: initialStatus,
      },
    });

    let contractorProfile = null;
    if (assignedRole === UserRole.CONTRACTOR) {
      contractorProfile = await prisma.contractorProfile.create({
        data: {
          userId: user.id,
          companyName: companyName || fullName,
          gstNumber: gstNumber || null,
          licenseNumber: licenseNumber || null,
          address: address || 'Delhi NCR',
          latitude: latitude ? parseFloat(latitude) : 28.6139,
          longitude: longitude ? parseFloat(longitude) : 77.209,
          operatingRadiusKm: operatingRadiusKm ? parseFloat(operatingRadiusKm) : 25.0,
          experienceYears: experienceYears ? parseInt(experienceYears, 10) : 0,
          machinery: typeof machinery === 'string' ? machinery : JSON.stringify(machinery || []),
          workforceCount: workforceCount ? parseInt(workforceCount, 10) : 0,
          status: VerificationStatus.PENDING,
          rating: 5.0,
        },
      });

      // Notify Admins about new contractor registration
      const admins = await prisma.user.findMany({ where: { role: UserRole.ADMIN } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'New Contractor Registration Pending',
            message: `${companyName || fullName} registered and requires document verification.`,
            type: 'CONTRACTOR_REGISTRATION',
            link: '/admin/contractors',
          },
        });
      }
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: assignedRole === UserRole.CONTRACTOR
        ? 'Contractor registration submitted! Account is pending PWD administrator verification.'
        : 'Registration successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        contractorProfile,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal registration error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { contractorProfile: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.SUSPENDED) {
      return res.status(403).json({ error: 'Account has been suspended. Please contact administrator.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        contractorProfile: user.contractorProfile,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal login error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        contractorProfile: {
          include: {
            documents: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      contractorProfile: user.contractorProfile,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
