import cron from 'node-cron';
import prisma from '../prisma';
import { ContractStatus, UserRole } from '@prisma/client';

/**
 * Checks tender bidding deadlines and transitions expired tenders to UNDER_REVIEW
 */
export const runBiddingClosureCheck = async () => {
  const now = new Date();
  
  // Find open contracts past their bidding deadline
  const expiredContracts = await prisma.repairContract.findMany({
    where: {
      status: ContractStatus.OPEN_FOR_BIDDING,
      biddingDeadline: {
        lte: now,
      },
    },
    include: {
      bids: {
        include: {
          contractor: true,
        },
      },
    },
  });

  const closedContracts: string[] = [];

  if (expiredContracts.length > 0) {
    console.log(`⏰ [Cron Engine] Found ${expiredContracts.length} expired tender(s) past deadline. Closing bidding...`);

    for (const contract of expiredContracts) {
      // Transition contract to UNDER_REVIEW
      await prisma.repairContract.update({
        where: { id: contract.id },
        data: { status: ContractStatus.UNDER_REVIEW },
      });

      closedContracts.push(contract.contractNumber);

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          action: 'AUTO_CLOSE_BIDDING',
          entityType: 'RepairContract',
          entityId: contract.id,
          details: `Bidding deadline reached (${contract.biddingDeadline.toISOString()}). Automatically transitioned to UNDER_REVIEW with ${contract.bids.length} submitted bids.`,
        },
      });

      // Notify PWD Administrators
      const admins = await prisma.user.findMany({ where: { role: UserRole.ADMIN } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: `Tender Bidding Concluded: ${contract.contractNumber}`,
            message: `Deadline has expired for "${contract.title}". ${contract.bids.length} bid(s) received. Ready for tender evaluation and award.`,
            type: 'BIDDING_CLOSED',
            link: `/admin/contracts/${contract.id}`,
          },
        });
      }

      // Notify all participating contractors
      for (const bid of contract.bids) {
        await prisma.notification.create({
          data: {
            userId: bid.contractor.userId,
            title: `Bidding Closed: ${contract.contractNumber}`,
            message: `Bidding has concluded for contract "${contract.title}". The PWD Chief Engineer is currently evaluating submitted proposals.`,
            type: 'BIDDING_CONCLUDED',
            link: `/contractor/contracts/${contract.id}`,
          },
        });
      }
    }
  }

  return {
    success: true,
    timestamp: now.toISOString(),
    expiredTendersClosed: expiredContracts.length,
    contracts: closedContracts,
  };
};

/**
 * SmartRoad AI Automated Cron Maintenance Engine
 * Performs scheduled platform tasks:
 * 1. Automatic Bidding Closure (Default every minute or configurable via CRON_SCHEDULE)
 * 2. Hourly Telemetry Heartbeat
 */
export const startCronJobs = () => {
  const schedulePattern = process.env.CRON_SCHEDULE || '* * * * *';
  console.log(`⏰ [Cron Engine] Initializing scheduled maintenance jobs (Schedule: "${schedulePattern}")...`);

  // Job 1: Check for expired tenders and close bidding automatically
  cron.schedule(schedulePattern, async () => {
    try {
      await runBiddingClosureCheck();
    } catch (err: any) {
      console.error('❌ [Cron Engine] Error in bidding closure cron job:', err.message);
    }
  });

  // Job 2: Runs hourly - Log active telemetry heartbeat
  cron.schedule('0 * * * *', async () => {
    try {
      const [openContracts, pendingReports] = await Promise.all([
        prisma.repairContract.count({ where: { status: ContractStatus.OPEN_FOR_BIDDING } }),
        prisma.damageReport.count({ where: { status: { in: ['SUBMITTED', 'AI_PROCESSED'] } } }),
      ]);
      console.log(`⏰ [Cron Engine] Hourly status: ${openContracts} open contracts, ${pendingReports} pending reports awaiting review.`);
    } catch (err: any) {
      console.error('❌ [Cron Engine] Error in hourly health heartbeat:', err.message);
    }
  });

  console.log('✅ [Cron Engine] Scheduled background maintenance tasks running successfully.');
};
