/**
 * Rate Limit Status API
 * Provides rate limit information and statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getRateLimitStatus,
  getRateLimitStats,
  formatRateLimitInfo,
  resetUserRateLimit
} from '@/lib/rate-limit/utils';
import { RATE_LIMIT_TIERS, ENDPOINT_LIMITS } from '@/lib/rate-limit/config';

/**
 * GET /api/rate-limit
 * Get current rate limit status for the requesting user
 */
export async function GET(request: NextRequest) {
  try {
    // Extract user ID from token/session (mock for now)
    const userId = request.headers.get('x-user-id') || undefined;

    // Get rate limit status
    const status = await getRateLimitStatus(userId);

    // Get tier configuration
    const tierConfig = RATE_LIMIT_TIERS[status.tier];

    return NextResponse.json({
      status: 'success',
      data: {
        tier: status.tier,
        limit: status.limit,
        remaining: status.remaining,
        reset: status.reset.toISOString(),
        resetIn: Math.ceil((status.reset.getTime() - Date.now()) / 1000),
        blocked: status.blocked,
        percentage: Math.round((status.remaining / status.limit) * 100),
        formatted: formatRateLimitInfo(status),
        tierConfig: {
          name: status.tier,
          requestsPerMinute: tierConfig.points,
          blockDurationSeconds: tierConfig.blockDuration,
        },
        endpoints: Object.entries(ENDPOINT_LIMITS)
          .filter(([key]) => !key.includes('*') && key !== 'default')
          .map(([endpoint, config]) => ({
            endpoint,
            limit: config.points,
            duration: config.duration,
          }))
          .slice(0, 5), // Show top 5 endpoints
      },
    });
  } catch (error) {
    console.error('[Rate Limit API] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch rate limit status',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rate-limit/check
 * Check if a specific action can be performed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, customLimit } = body;

    if (!action) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Action parameter is required',
        },
        { status: 400 }
      );
    }

    // Extract user ID from token/session (mock for now)
    const userId = request.headers.get('x-user-id') || undefined;

    // Check if action can be performed
    const { canPerformAction } = await import('@/lib/rate-limit/utils');
    const result = await canPerformAction(action, userId, customLimit);

    return NextResponse.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('[Rate Limit Check API] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to check rate limit',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rate-limit/stats
 * Get rate limit statistics (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Check admin authorization
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Get rate limit statistics
    const stats = await getRateLimitStats();

    return NextResponse.json({
      status: 'success',
      data: {
        ...stats,
        tiers: Object.entries(RATE_LIMIT_TIERS).map(([name, config]) => ({
          name,
          requestsPerMinute: config.points,
          blockDurationSeconds: config.blockDuration,
        })),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Rate Limit Stats API] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch rate limit statistics',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rate-limit/reset
 * Reset rate limit for a user (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Check admin authorization
    const adminKey = request.headers.get('x-admin-key') || '';

    // Reset user rate limit
    const result = await resetUserRateLimit(userId, adminKey);

    if (!result.success) {
      return NextResponse.json(
        {
          status: 'error',
          message: result.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    console.error('[Rate Limit Reset API] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to reset rate limit',
      },
      { status: 500 }
    );
  }
}