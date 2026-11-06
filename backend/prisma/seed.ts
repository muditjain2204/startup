import { PrismaClient, UserRole, UserStatus, VerificationStatus, DamageCategory, SeverityLevel, ReportStatus, ContractStatus, BidStatus, ProjectStatus, RepairStage } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SmartRoad AI database seed...');

  // Clean existing records in correct relation order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.repairUpdate.deleteMany();
  await prisma.repairProject.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.repairContract.deleteMany();
  await prisma.damageEvidence.deleteMany();
  await prisma.damageDetection.deleteMany();
  await prisma.damageReport.deleteMany();
  await prisma.qRScan.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.contractorDocument.deleteMany();
  await prisma.contractorProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.detectionThreshold.deleteMany();

  // 1. Detection Thresholds
  await prisma.detectionThreshold.create({
    data: {
      minConfidence: 0.65,
      minPotholeAreaSqM: 0.05,
      minEstimatedDepthCm: 3.0,
      highSeverityDepthCm: 8.0,
      maxGpsAccuracyToleranceM: 30.0,
      duplicateDistanceThresholdM: 25.0,
    },
  });

  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('Admin@123', saltRounds);
  const contractorPassword = await bcrypt.hash('Contractor@123', saltRounds);
  const citizenPassword = await bcrypt.hash('Citizen@123', saltRounds);

  // 2. Users
  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@smartroad.gov.in',
      passwordHash: adminPassword,
      fullName: 'Er. Rajesh Varma (Chief PWD Engineer)',
      phone: '+91 98110 23456',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // Contractor 1 (Approved)
  const contractorUser1 = await prisma.user.create({
    data: {
      email: 'info@rajputroadworks.com',
      passwordHash: contractorPassword,
      fullName: 'Vikram Rajput',
      phone: '+91 98201 54321',
      role: UserRole.CONTRACTOR,
      status: UserStatus.ACTIVE,
    },
  });

  const contractorProfile1 = await prisma.contractorProfile.create({
    data: {
      userId: contractorUser1.id,
      companyName: 'M/s Rajput Road Infrastructures Pvt Ltd',
      gstNumber: '07AAAAA0000A1Z5',
      licenseNumber: 'PWD/DEL/CLASS-A/2022/894',
      address: 'Plot 42, Okhla Industrial Area Phase-III, New Delhi 110020',
      latitude: 28.5355,
      longitude: 77.2732,
      operatingRadiusKm: 30.0,
      experienceYears: 12,
      machinery: JSON.stringify(['Vögele Asphalt Paver Super 1800', 'Hamm HD 90 Tandem Roller', 'Wirtgen Cold Milling Machine W100', 'Bitumen Sprayer 4000L', 'Pothole Patcher Truck']),
      workforceCount: 45,
      status: VerificationStatus.APPROVED,
      rating: 4.85,
      documents: {
        create: [
          {
            documentType: 'GST',
            title: 'GSTIN Registration Certificate',
            fileUrl: '/uploads/docs/rajput_gst.pdf',
            verified: true,
          },
          {
            documentType: 'LICENSE',
            title: 'CPWD Class-A Contractor Enrolment',
            fileUrl: '/uploads/docs/rajput_license.pdf',
            verified: true,
          },
        ],
      },
    },
  });

  // Contractor 2 (Approved)
  const contractorUser2 = await prisma.user.create({
    data: {
      email: 'contact@delhipaving.in',
      passwordHash: contractorPassword,
      fullName: 'Sanjay Aggarwal',
      phone: '+91 99100 87654',
      role: UserRole.CONTRACTOR,
      status: UserStatus.ACTIVE,
    },
  });

  const contractorProfile2 = await prisma.contractorProfile.create({
    data: {
      userId: contractorUser2.id,
      companyName: 'Delhi Modern Paving & Civil Works Ltd',
      gstNumber: '07BBBBB1111B2Z6',
      licenseNumber: 'PWD/DEL/CLASS-B/2023/1102',
      address: 'Shop 18, Commercial Complex, Laxmi Nagar, East Delhi 110092',
      latitude: 28.6315,
      longitude: 77.2773,
      operatingRadiusKm: 25.0,
      experienceYears: 8,
      machinery: JSON.stringify(['Dynapac Vibratory Roller', 'Tata Pavemaster 4500', 'Hot Mix Asphalt Transport Container', 'Diamond Core Cutter']),
      workforceCount: 28,
      status: VerificationStatus.APPROVED,
      rating: 4.6,
      documents: {
        create: [
          {
            documentType: 'GST',
            title: 'GST Registration Certificate',
            fileUrl: '/uploads/docs/delhipaving_gst.pdf',
            verified: true,
          },
        ],
      },
    },
  });

  // Contractor 3 (Pending Approval)
  const contractorUser3 = await prisma.user.create({
    data: {
      email: 'tenders@sharmabuilders.co',
      passwordHash: contractorPassword,
      fullName: 'Anil Sharma',
      phone: '+91 97112 33445',
      role: UserRole.CONTRACTOR,
      status: UserStatus.PENDING_APPROVAL,
    },
  });

  await prisma.contractorProfile.create({
    data: {
      userId: contractorUser3.id,
      companyName: 'Sharma & Sons Infra Solutions LLP',
      gstNumber: '07CCCCC2222C3Z7',
      licenseNumber: 'PWD/DEL/CLASS-B/2024/0411',
      address: 'Sector 15, Rohini, North West Delhi 110089',
      latitude: 28.7166,
      longitude: 77.1235,
      operatingRadiusKm: 20.0,
      experienceYears: 5,
      machinery: JSON.stringify(['Mini Asphalt Roller', 'Bitumen Emulsion Sprayer']),
      workforceCount: 16,
      status: VerificationStatus.PENDING,
      rating: 5.0,
      documents: {
        create: [
          {
            documentType: 'GST',
            title: 'GST Filing Proof 2025-26',
            fileUrl: '/uploads/docs/sharma_gst.pdf',
            verified: false,
          },
          {
            documentType: 'LICENSE',
            title: 'Municipal Contractor Enlistment',
            fileUrl: '/uploads/docs/sharma_license.pdf',
            verified: false,
          },
        ],
      },
    },
  });

  // Citizens
  const citizen1 = await prisma.user.create({
    data: {
      email: 'aarav.sharma@gmail.com',
      passwordHash: citizenPassword,
      fullName: 'Aarav Sharma',
      phone: '+91 98712 12345',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    },
  });

  const citizen2 = await prisma.user.create({
    data: {
      email: 'priya.verma@outlook.com',
      passwordHash: citizenPassword,
      fullName: 'Priya Verma',
      phone: '+91 98109 87654',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    },
  });

  // 3. QR Codes
  const qr1 = await prisma.qRCode.create({
    data: {
      code: 'SR-NDLS-001',
      locationName: 'Barakhamba Road, Outer Circle, Connaught Place',
      latitude: 28.6315,
      longitude: 77.2272,
      isActive: true,
      scanCount: 142,
    },
  });

  const qr2 = await prisma.qRCode.create({
    data: {
      code: 'SR-NDLS-002',
      locationName: 'Ring Road near AIIMS Flyover & Safdarjung Hospital',
      latitude: 28.5672,
      longitude: 77.2100,
      isActive: true,
      scanCount: 89,
    },
  });

  const qr3 = await prisma.qRCode.create({
    data: {
      code: 'SR-NDLS-003',
      locationName: 'Vikas Marg intersection near Nirman Vihar Metro',
      latitude: 28.6358,
      longitude: 77.2842,
      isActive: true,
      scanCount: 64,
    },
  });

  const qr4 = await prisma.qRCode.create({
    data: {
      code: 'SR-NDLS-004',
      locationName: 'Mathura Road near Ashram Chowk Flyover',
      latitude: 28.5721,
      longitude: 77.2541,
      isActive: true,
      scanCount: 215,
    },
  });

  // 4. Damage Reports, Detections, and Evidence
  // Report 1: Deep Pothole (Munirka Outer Ring Road) - VERIFIED
  const report1 = await prisma.damageReport.create({
    data: {
      reportNumber: 'SR-2026-0001',
      reporterId: citizen1.id,
      title: 'Large dangerous crater in central carriageway',
      description: 'Vehicle tires getting damaged on rainy evenings. Severe crater depth exceeding 9cm on Outer Ring Road right before Munirka flyover ascent.',
      latitude: 28.5583,
      longitude: 77.1738,
      address: 'Outer Ring Road, Munirka Westbound lane, New Delhi',
      city: 'South Delhi',
      damageCategory: DamageCategory.POTHOLE,
      status: ReportStatus.VERIFIED,
      adminNotes: 'Verified on-site by PWD Junior Engineer. High hazard level for two-wheelers. Priority repair required.',
      detections: {
        create: [
          {
            damageCategory: 'POTHOLE',
            confidence: 0.94,
            severity: SeverityLevel.CRITICAL,
            estimatedAreaSqM: 0.85,
            estimatedDepthCm: 9.8,
            boundingBoxJson: JSON.stringify([{ ymin: 0.35, xmin: 0.28, ymax: 0.72, xmax: 0.68, label: 'pothole', conf: 0.94 }]),
            annotatedImageUrl: '/uploads/evidence/pothole_munirka_annotated.jpg',
          },
        ],
      },
      evidence: {
        create: [
          {
            mediaType: 'IMAGE',
            mediaUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=300&q=80',
            gpsLat: 28.5583,
            gpsLng: 77.1738,
          },
        ],
      },
    },
  });

  // Report 2: Alligator Cracking & Pothole (Mathura Road, Ashram) - CONTRACTED
  const report2 = await prisma.damageReport.create({
    data: {
      reportNumber: 'SR-2026-0002',
      reporterId: citizen2.id,
      qrCodeId: qr4.id,
      title: 'Severe alligator cracking and broken bitumen layer',
      description: 'Extensive sub-base cracking stretching 15 meters along the bus lane. Multiple small depressions forming rapidly.',
      latitude: 28.5721,
      longitude: 77.2541,
      address: 'Mathura Road near Ashram Chowk Underpass',
      city: 'South East Delhi',
      damageCategory: DamageCategory.ALLIGATOR_CRACK,
      status: ReportStatus.CONTRACTED,
      adminNotes: 'Approved for competitive emergency repair bidding. PostGIS radius set to 25km.',
      detections: {
        create: [
          {
            damageCategory: 'ALLIGATOR_CRACK',
            confidence: 0.89,
            severity: SeverityLevel.HIGH,
            estimatedAreaSqM: 14.2,
            estimatedDepthCm: 4.5,
            boundingBoxJson: JSON.stringify([{ ymin: 0.22, xmin: 0.15, ymax: 0.85, xmax: 0.82, label: 'alligator_crack', conf: 0.89 }]),
            annotatedImageUrl: '/uploads/evidence/cracking_ashram_annotated.jpg',
          },
        ],
      },
      evidence: {
        create: [
          {
            mediaType: 'IMAGE',
            mediaUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=300&q=80',
            gpsLat: 28.5721,
            gpsLng: 77.2541,
          },
        ],
      },
    },
  });

  // Report 3: Surface Break (Vikas Marg) - SUBMITTED
  const report3 = await prisma.damageReport.create({
    data: {
      reportNumber: 'SR-2026-0003',
      qrCodeId: qr3.id,
      title: 'Asphalt peeling off after recent pipe laying work',
      description: 'Utility trench settlement resulting in broken road surface edge.',
      latitude: 28.6358,
      longitude: 77.2842,
      address: 'Vikas Marg near Pillar 58, Laxmi Nagar',
      city: 'East Delhi',
      damageCategory: DamageCategory.SURFACE_BREAK,
      status: ReportStatus.SUBMITTED,
      detections: {
        create: [
          {
            damageCategory: 'SURFACE_BREAK',
            confidence: 0.84,
            severity: SeverityLevel.MEDIUM,
            estimatedAreaSqM: 3.1,
            estimatedDepthCm: 4.0,
            boundingBoxJson: JSON.stringify([{ ymin: 0.3, xmin: 0.2, ymax: 0.7, xmax: 0.8, label: 'surface_break', conf: 0.84 }]),
            annotatedImageUrl: '/uploads/evidence/surface_vikas_annotated.jpg',
          },
        ],
      },
      evidence: {
        create: [
          {
            mediaType: 'IMAGE',
            mediaUrl: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=1200&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=300&q=80',
            gpsLat: 28.6358,
            gpsLng: 77.2842,
          },
        ],
      },
    },
  });

  // Report 4: Completed repair (Aurobindo Marg) - REPAIRED
  const report4 = await prisma.damageReport.create({
    data: {
      reportNumber: 'SR-2026-0004',
      reporterId: citizen1.id,
      qrCodeId: qr2.id,
      title: 'Deep road cavity repaired successfully',
      description: 'Cavity repaired by M/s Rajput Road Infrastructures. Bitumen hot-mix cold milled and rolled.',
      latitude: 28.5590,
      longitude: 77.2050,
      address: 'Aurobindo Marg near Green Park Main Market',
      city: 'South Delhi',
      damageCategory: DamageCategory.POTHOLE,
      status: ReportStatus.REPAIRED,
      adminNotes: 'Inspection passed on 04-Nov-2026. Smooth surface transition verified.',
      detections: {
        create: [
          {
            damageCategory: 'POTHOLE',
            confidence: 0.91,
            severity: SeverityLevel.HIGH,
            estimatedAreaSqM: 1.2,
            estimatedDepthCm: 7.5,
          },
        ],
      },
      evidence: {
        create: [
          {
            mediaType: 'IMAGE',
            mediaUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=300&q=80',
            gpsLat: 28.5590,
            gpsLng: 77.2050,
          },
        ],
      },
    },
  });

  // 5. Repair Contracts
  // Active contract for Report 2
  const contract1 = await prisma.repairContract.create({
    data: {
      contractNumber: 'RC-2026-0001',
      damageReportId: report2.id,
      title: 'Ashram Chowk Surface Milling & Bituminous Concrete Overlay',
      description: 'Milling of damaged surface to 50mm depth, tack coat application, and 50mm Bituminous Concrete (BC) overlay according to MoRTH Section 500 standards.',
      repairRequirements: 'Work to be executed between 11:00 PM and 5:00 AM with proper traffic marshals and luminous safety signage. Minimum 2-year performance guarantee.',
      estimatedBudget: 185000,
      targetLatitude: 28.5721,
      targetLongitude: 77.2541,
      eligibleRadiusKm: 25.0,
      biddingDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: ContractStatus.OPEN_FOR_BIDDING,
    },
  });

  // Bids on Contract 1
  const bid1 = await prisma.bid.create({
    data: {
      contractId: contract1.id,
      contractorId: contractorProfile1.id,
      amount: 174000,
      estimatedDays: 3,
      proposalDetails: 'Includes 50mm cold milling, tack coat, VG-30 grade hot mix asphalt with tandem roller compaction.',
      status: BidStatus.SUBMITTED,
    },
  });

  const bid2 = await prisma.bid.create({
    data: {
      contractId: contract1.id,
      contractorId: contractorProfile2.id,
      amount: 168500,
      estimatedDays: 4,
      proposalDetails: 'Mobilization of Dynapac vibratory roller within 12 hours of award. Complete MoRTH compliance.',
      status: BidStatus.SUBMITTED,
    },
  });

  // Contract for Completed Report 4
  const contract2 = await prisma.repairContract.create({
    data: {
      contractNumber: 'RC-2026-0002',
      damageReportId: report4.id,
      title: 'Aurobindo Marg Rapid Cavity Patching Project',
      description: 'Full depth patching of cavity and edge sealing on Aurobindo Marg.',
      repairRequirements: 'Immediate hot-mix asphalt patching with mechanical vibratory plate compactor.',
      estimatedBudget: 75000,
      targetLatitude: 28.5590,
      targetLongitude: 77.2050,
      eligibleRadiusKm: 20.0,
      biddingDeadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: ContractStatus.AWARDED,
      awardedBidId: 'legacy-bid-001',
    },
  });

  // Completed Project for Contract 2
  const project2 = await prisma.repairProject.create({
    data: {
      contractId: contract2.id,
      contractorId: contractorProfile1.id,
      status: ProjectStatus.COMPLETED,
      startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      completionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      inspectionNotes: 'Quality inspection verified. Smooth surface roughness and proper bitumen adhesion.',
      updates: {
        create: [
          {
            stage: RepairStage.BEFORE_REPAIR,
            notes: 'Site secured with barricades, perimeter marked, excavation of fractured asphalt started.',
            photoUrls: JSON.stringify(['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80']),
          },
          {
            stage: RepairStage.IN_PROGRESS,
            notes: 'Sub-base compacted to 98% Proctor density. Tack coat applied at 0.25 kg/sqm.',
            photoUrls: JSON.stringify(['https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80']),
          },
          {
            stage: RepairStage.AFTER_REPAIR,
            notes: 'Bituminous concrete laid and finished with pneumatic roller. Surface level verified flush with surrounding pavement.',
            photoUrls: JSON.stringify(['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80']),
          },
        ],
      },
    },
  });

  // 6. In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: 'New Damage Report Submitted',
        message: 'A new damage report SR-2026-0003 was submitted via QR code at Vikas Marg.',
        type: 'DAMAGE_REPORTED',
        link: '/admin/reports',
      },
      {
        userId: contractorUser1.id,
        title: 'New Tender Open for Bidding',
        message: 'Ashram Chowk Surface Overlay (RC-2026-0001) is now open within your 30km operating radius.',
        type: 'CONTRACT_AVAILABLE',
        link: '/contractor/contracts',
      },
      {
        userId: contractorUser2.id,
        title: 'New Tender Open for Bidding',
        message: 'Ashram Chowk Surface Overlay (RC-2026-0001) is within your service area.',
        type: 'CONTRACT_AVAILABLE',
        link: '/contractor/contracts',
      },
      {
        userId: citizen1.id,
        title: 'Your Report has been Repaired',
        message: 'Report SR-2026-0004 at Aurobindo Marg was successfully repaired and approved by PWD inspection.',
        type: 'REPAIR_COMPLETED',
        link: '/citizen/reports',
      },
    ],
  });

  // 7. Audit Log
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: 'VERIFY_DAMAGE',
        entityType: 'DamageReport',
        entityId: report1.id,
        details: 'Admin approved damage detection confidence 0.94 and marked as CRITICAL.',
      },
      {
        actorId: admin.id,
        action: 'PUBLISH_CONTRACT',
        entityType: 'RepairContract',
        entityId: contract1.id,
        details: 'Published contract RC-2026-0001 with budget Rs 1,85,000.',
      },
    ],
  });

  console.log('✅ SmartRoad AI seed completed successfully with real Delhi NCR infrastructure data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

