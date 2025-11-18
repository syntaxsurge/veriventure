/**
 * Rate Limiting Utilities
 * Helper functions for API routes
 */

import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { RATE_LIMIT_TIERS, ENDPOINT_LIMITS } from './config';

export interface RateLimitInfo {
  tier: keyof typeof RATE_LIMIT_TIERS;
  limit: number;
  remaining: number;
  reset: Date;
  blocked: boolean;
}

/**
 * Get current rate limit status for a user
 */
export async function getRateLimitStatus(userId?: string): Promise<RateLimitInfo> {
  // This would typically query Redis or your rate limit store
  // For now, returning mock data
  return {
    tier: userId ? 'free' : 'anonymous',
    limit: userId ? RATE_LIMIT_TIERS.free.points : RATE_LIMIT_TIERS.anonymous.points,
    remaining: 25,
    reset: new Date(Date.now() + 60000),
    blocked: false,
  };
}

/**
 * Check if a specific action can be performed
 */
export async function canPerformAction(
  action: string,
  userId?: string,
  customLimit?: number
): Promise<{ allowed: boolean; retryAfter?: number; reason?: string }> {
  const status = await getRateLimitStatus(userId);

  if (status.blocked) {
    return {
      allowed: false,
      retryAfter: 60,
      reason: 'Rate limit exceeded. Please try again later.',
    };
  }

  if (status.remaining <= 0) {
    const retryAfter = Math.ceil((status.reset.getTime() - Date.now()) / 1000);
    return {
      allowed: false,
      retryAfter,
      reason: `Rate limit exceeded. Please wait ${retryAfter} seconds.`,
    };
  }

  // Check custom limit for specific actions
  if (customLimit && status.remaining < customLimit) {
    return {
      allowed: false,
      reason: `This action requires ${customLimit} rate limit points. You have ${status.remaining} remaining.`,
    };
  }

  return { allowed: true };
}

/**
 * Consume rate limit points for a specific action
 */
export async function consumeRateLimit(
  action: string,
  points: number = 1,
  userId?: string
): Promise<{ success: boolean; remaining?: number; reset?: Date }> {
  // This would typically consume points from Redis
  // For now, returning mock data
  return {
    success: true,
    remaining: 24,
    reset: new Date(Date.now() + 60000),
  };
}

/**
 * Get rate limit configuration for an endpoint
 */
export function getEndpointRateLimit(pathname: string) {
  // Check exact match
  if (ENDPOINT_LIMITS[pathname]) {
    return ENDPOINT_LIMITS[pathname];
  }

  // Check wildcard matches
  for (const [pattern, config] of Object.entries(ENDPOINT_LIMITS)) {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      if (regex.test(pathname)) {
        return config;
      }
    }
  }

  return ENDPOINT_LIMITS.default;
}

/**
 * Parse rate limit headers from response
 */
export function parseRateLimitHeaders(response: Response): RateLimitInfo | null {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  const tier = response.headers.get('X-RateLimit-Tier');

  if (!limit || !remaining || !reset) {
    return null;
  }

  return {
    tier: (tier as keyof typeof RATE_LIMIT_TIERS) || 'anonymous',
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset: new Date(reset),
    blocked: false,
  };
}

/**
 * Format rate limit info for display
 */
export function formatRateLimitInfo(info: RateLimitInfo): string {
  const percentage = Math.round((info.remaining / info.limit) * 100);
  const resetIn = Math.ceil((info.reset.getTime() - Date.now()) / 1000);

  if (info.blocked) {
    return `Rate limit blocked. Resets in ${resetIn}s`;
  }

  if (percentage < 20) {
    return `⚠️ ${info.remaining}/${info.limit} requests remaining (${percentage}%). Resets in ${resetIn}s`;
  }

  return `${info.remaining}/${info.limit} requests remaining (${percentage}%)`;
}

/**
 * Calculate optimal request timing to avoid rate limits
 */
export function calculateOptimalRequestTiming(
  requestsNeeded: number,
  currentInfo: RateLimitInfo
): { delayMs: number; batches: number } {
  if (requestsNeeded <= currentInfo.remaining) {
    // Can make all requests immediately
    return { delayMs: 0, batches: 1 };
  }

  const resetMs = currentInfo.reset.getTime() - Date.now();
  const requestsPerBatch = currentInfo.limit;
  const batchesNeeded = Math.ceil(requestsNeeded / requestsPerBatch);

  // Calculate delay between batches
  const delayMs = Math.ceil(resetMs / batchesNeeded);

  return { delayMs, batches: batchesNeeded };
}

/**
 * Check if IP is rate limited
 */
export async function isIpRateLimited(ip: string): Promise<boolean> {
  // This would check Redis for IP-based rate limiting
  // For now, returning false
  return false;
}

/**
 * Reset rate limit for a user (admin function)
 */
export async function resetUserRateLimit(
  userId: string,
  adminKey: string
): Promise<{ success: boolean; message: string }> {
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return { success: false, message: 'Invalid admin key' };
  }

  // This would reset the user's rate limit in Redis
  // For now, returning success
  return { success: true, message: `Rate limit reset for user ${userId}` };
}

/**
 * Get rate limit statistics for monitoring
 */
export async function getRateLimitStats(): Promise<{
  totalRequests: number;
  blockedRequests: number;
  averageUsage: number;
  topUsers: Array<{ userId: string; requests: number }>;
}> {
  // This would query Redis for aggregated statistics
  // For now, returning mock data
  return {
    totalRequests: 150000,
    blockedRequests: 500,
    averageUsage: 45,
    topUsers: [
      { userId: 'user1', requests: 450 },
      { userId: 'user2', requests: 380 },
      { userId: 'user3', requests: 290 },
    ],
  };
}