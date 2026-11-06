import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const createQRCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code, locationName, latitude, longitude } = req.body;

    if (!locationName || !latitude || !longitude) {
      return res.status(400).json({ error: 'Location name and GPS coordinates are required' });
    }

    const uniqueCode = code || `SR-DEL-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await prisma.qRCode.findUnique({ where: { code: uniqueCode } });
    if (existing) {
      return res.status(400).json({ error: 'QR Code identifier already exists' });
    }

    const qr = await prisma.qRCode.create({
      data: {
        code: uniqueCode,
        locationName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        isActive: true,
      },
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const reportingUrl = `${clientUrl}/qr/${qr.code}`;
    const qrDataUrl = await QRCode.toDataURL(reportingUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff',
      },
    });

    res.status(201).json({
      message: 'QR code generated successfully!',
      qrCode: qr,
      reportingUrl,
      qrDataUrl,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getQRCodes = async (req: AuthRequest, res: Response) => {
  try {
    const qrCodes = await prisma.qRCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { scans: true, reports: true },
        },
      },
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const enhanced = await Promise.all(
      qrCodes.map(async (q) => {
        const reportingUrl = `${clientUrl}/qr/${q.code}`;
        const qrDataUrl = await QRCode.toDataURL(reportingUrl, { width: 250, margin: 1 });
        return {
          ...q,
          reportingUrl,
          qrDataUrl,
        };
      })
    );

    res.json({ qrCodes: enhanced });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getQRByCode = async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;

    const qr = await prisma.qRCode.findUnique({
      where: { code },
      include: {
        reports: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            reportNumber: true,
            damageCategory: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!qr) {
      return res.status(404).json({ error: 'QR Code not recognized in SmartRoad registry' });
    }

    if (!qr.isActive) {
      return res.status(400).json({ error: 'This QR code has been deactivated' });
    }

    res.json({ qrCode: qr });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const recordScan = async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    const { latitude, longitude, accuracyMeters, userAgent } = req.body;

    const qr = await prisma.qRCode.findUnique({ where: { code } });
    if (!qr) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const scan = await prisma.qRScan.create({
      data: {
        qrCodeId: qr.id,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        accuracyMeters: accuracyMeters ? parseFloat(accuracyMeters) : null,
        userAgent: userAgent || (req.headers['user-agent'] as string) || null,
        ipAddress: req.ip || null,
      },
    });

    await prisma.qRCode.update({
      where: { id: qr.id },
      data: { scanCount: { increment: 1 } },
    });

    res.status(201).json({ message: 'Scan recorded', scan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
