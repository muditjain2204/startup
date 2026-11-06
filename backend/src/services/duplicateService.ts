import prisma from '../prisma';
import { calculateDistanceKm } from './geoService';

export const checkPotentialDuplicates = async (latitude: number, longitude: number, excludeReportId?: string) => {
  // Query active reports
  const candidates = await prisma.damageReport.findMany({
    where: {
      id: excludeReportId ? { not: excludeReportId } : undefined,
      duplicateOfId: null, // Only compare against primary parent reports
      status: {
        notIn: ['REJECTED', 'REPAIRED'],
      },
    },
    include: {
      detections: true,
      evidence: true,
    },
  });

  // Filter within 25 meters (0.025 km)
  const duplicates = candidates
    .map((report) => {
      const distanceKm = calculateDistanceKm(latitude, longitude, report.latitude, report.longitude);
      const distanceMeters = Math.round(distanceKm * 1000);
      return {
        ...report,
        distanceMeters,
      };
    })
    .filter((r) => r.distanceMeters <= 50) // Within 50 meters
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  return duplicates;
};
