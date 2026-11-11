import { Request, Response } from 'express';
import { runBiddingClosureCheck } from '../services/cronService';

/**
 * HTTP Webhook endpoint to trigger cron maintenance jobs externally
 * (e.g. from cron-job.org, EasyCron, GitHub Actions, Vercel Cron, or curl)
 */
export const triggerCronJob = async (req: Request, res: Response) => {
  try {
    const configuredSecret = process.env.CRON_SECRET || 'smartroad-cron-secret-key-2026';
    const authHeader = req.headers.authorization;
    const querySecret = req.query.secret as string;
    const headerSecret = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null;

    if (configuredSecret && querySecret !== configuredSecret && headerSecret !== configuredSecret) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or missing CRON_SECRET. Pass ?secret=... or Authorization: Bearer <CRON_SECRET>',
      });
    }

    const result = await runBiddingClosureCheck();
    res.json({
      message: 'SmartRoad AI cron maintenance executed successfully!',
      ...result,
    });
  } catch (error: any) {
    console.error('❌ [Cron Webhook Error]:', error);
    res.status(500).json({ error: error.message });
  }
};

