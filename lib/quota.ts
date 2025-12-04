import { prisma } from "./db";
import { logger } from "./logger";

const QUOTA_SOFT_THRESHOLD = 10000; // Soft threshold for daily API calls
const QUOTA_HARD_THRESHOLD = 15000; // Hard threshold (shouldn't reach this)

/**
 * Track API usage for quota management
 * @param requestCount Number of API requests made
 * @param estimatedCost Estimated cost in dollars
 */
export async function trackApiUsage(
  requestCount: number = 1,
  estimatedCost: number = 0
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.apiQuota.upsert({
    where: { date: today },
    create: {
      date: today,
      requestCount,
      estimatedCost,
    },
    update: {
      requestCount: {
        increment: requestCount,
      },
      estimatedCost: {
        increment: estimatedCost,
      },
    },
  });
}

/**
 * Check if backoff should be enabled based on quota
 * @returns True if backoff should be enabled
 */
export async function shouldEnableBackoff(): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const quota = await prisma.apiQuota.findUnique({
    where: { date: today },
  });

  if (!quota) {
    return false;
  }

  const shouldBackoff = quota.requestCount >= QUOTA_SOFT_THRESHOLD;

  // Update backoff status
  if (quota.backoffEnabled !== shouldBackoff) {
    await prisma.apiQuota.update({
      where: { id: quota.id },
      data: { backoffEnabled: shouldBackoff },
    });

    logger.warn(
      {
        requestCount: quota.requestCount,
        backoffEnabled: shouldBackoff,
      },
      `Quota backoff ${shouldBackoff ? "enabled" : "disabled"}`
    );
  }

  return shouldBackoff;
}

/**
 * Get current quota status
 */
export async function getQuotaStatus() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const quota = await prisma.apiQuota.findUnique({
    where: { date: today },
  });

  return {
    requestCount: quota?.requestCount || 0,
    estimatedCost: quota?.estimatedCost || 0,
    backoffEnabled: quota?.backoffEnabled || false,
    softThreshold: QUOTA_SOFT_THRESHOLD,
    hardThreshold: QUOTA_HARD_THRESHOLD,
  };
}


