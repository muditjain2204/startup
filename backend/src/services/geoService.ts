import prisma from '../prisma';
import { VerificationStatus } from '@prisma/client';

/**
 * Computes great-circle distance between two GPS coordinates using Haversine formula (in km)
 */
export const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Finds all approved contractors whose operating radius covers the target contract coordinate
 */
export const findEligibleContractors = async (targetLat: number, targetLng: number, contractEligibleRadiusKm: number) => {
  const approvedContractors = await prisma.contractorProfile.findMany({
    where: {
      status: VerificationStatus.APPROVED,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
        },
      },
    },
  });

  return approvedContractors
    .map((contractor) => {
      const distanceKm = calculateDistanceKm(contractor.latitude, contractor.longitude, targetLat, targetLng);
      // Eligible if distance is within contractor's operating radius AND within contract's eligible radius
      const isEligible = distanceKm <= contractor.operatingRadiusKm && distanceKm <= contractEligibleRadiusKm;
      return {
        ...contractor,
        distanceKm,
        isEligible,
      };
    })
    .filter((c) => c.isEligible)
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

