/**
 * Error Reporting API
 * Handles client-side error reports for monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  retryCount?: number;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

// Store for recent errors (in production, use a proper database/service)
const recentErrors = new Map<string, ErrorReport>();
const MAX_STORED_ERRORS = 1000;

/**
 * POST /api/errors/report
 * Report a client-side error
 */
export async function POST(request: NextRequest) {
  try {
    const body: ErrorReport = await request.json();

    // Validate required fields
    if (!body.errorId || !body.message) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required fields: errorId and message',
        },
        { status: 400 }
      );
    }

    // Extract user information from session/token if available
    const userId = request.headers.get('x-user-id') || undefined;
    const sessionId = request.cookies.get('session')?.value || undefined;

    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

    // Enrich error report
    const enrichedReport: ErrorReport = {
      ...body,
      userId,
      sessionId,
      timestamp: body.timestamp || new Date().toISOString(),
      metadata: {
        ...body.metadata,
        ip: ipAddress,
        referer: request.headers.get('referer') || 'direct',
      },
    };

    // Store error (with size limit)
    if (recentErrors.size >= MAX_STORED_ERRORS) {
      const firstKey = recentErrors.keys().next().value;
      if (firstKey) {
        recentErrors.delete(firstKey);
      }
    }
    recentErrors.set(body.errorId, enrichedReport);

    // Log error for monitoring
    console.error('[Error Report]', {
      errorId: body.errorId,
      message: body.message,
      url: body.url,
      userId,
    });

    // In production, send to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      await sendToMonitoringService(enrichedReport);
    }

    // Send alert for critical errors
    if (isCriticalError(body)) {
      await sendAlertToTeam(enrichedReport);
    }

    return NextResponse.json({
      status: 'success',
      message: 'Error reported successfully',
      errorId: body.errorId,
    });
  } catch (error) {
    console.error('[Error Report API] Failed to process error report:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to report error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/errors/report
 * Get recent error reports (admin only)
 */
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const errorId = searchParams.get('errorId');

    // Return specific error if ID provided
    if (errorId) {
      const error = recentErrors.get(errorId);
      if (!error) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Error not found',
          },
          { status: 404 }
        );
      }
      return NextResponse.json({
        status: 'success',
        data: error,
      });
    }

    // Return recent errors
    const errors = Array.from(recentErrors.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    // Calculate statistics
    const stats = {
      total: recentErrors.size,
      last24Hours: errors.filter(e => {
        const hourAgo = Date.now() - 24 * 60 * 60 * 1000;
        return new Date(e.timestamp).getTime() > hourAgo;
      }).length,
      byType: errors.reduce((acc, e) => {
        const type = categorizeError(e);
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      topPages: getTopErrorPages(errors),
    };

    return NextResponse.json({
      status: 'success',
      data: {
        errors,
        stats,
      },
    });
  } catch (error) {
    console.error('[Error Report API] Failed to fetch errors:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch error reports',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/errors/report
 * Clear error reports (admin only)
 */
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const errorId = searchParams.get('errorId');

    if (errorId) {
      // Delete specific error
      recentErrors.delete(errorId);
      return NextResponse.json({
        status: 'success',
        message: `Error ${errorId} deleted`,
      });
    }

    // Clear all errors
    const count = recentErrors.size;
    recentErrors.clear();

    return NextResponse.json({
      status: 'success',
      message: `Cleared ${count} error reports`,
    });
  } catch (error) {
    console.error('[Error Report API] Failed to clear errors:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to clear error reports',
      },
      { status: 500 }
    );
  }
}

// Helper functions

function isCriticalError(error: ErrorReport): boolean {
  const criticalKeywords = [
    'CRITICAL',
    'FATAL',
    'SecurityError',
    'PaymentError',
    'AuthenticationError',
    'DataLoss',
  ];

  return criticalKeywords.some(keyword =>
    error.message.includes(keyword) ||
    error.stack?.includes(keyword)
  );
}

function categorizeError(error: ErrorReport): string {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch')) return 'network';
  if (message.includes('auth') || message.includes('permission')) return 'authentication';
  if (message.includes('payment') || message.includes('stripe')) return 'payment';
  if (message.includes('validation') || message.includes('invalid')) return 'validation';
  if (message.includes('timeout')) return 'timeout';
  if (message.includes('rate limit')) return 'rateLimit';

  return 'general';
}

function getTopErrorPages(errors: ErrorReport[]): Array<{ url: string; count: number }> {
  const pageCounts = errors.reduce((acc, error) => {
    const url = new URL(error.url).pathname;
    acc[url] = (acc[url] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([url, count]) => ({ url, count }));
}

async function sendToMonitoringService(error: ErrorReport): Promise<void> {
  // Integration with services like Sentry, LogRocket, Bugsnag, etc.
  try {
    // Example: Send to Sentry
    if (process.env.SENTRY_DSN) {
      // await Sentry.captureException(error);
    }

    // Example: Send to custom webhook
    if (process.env.ERROR_WEBHOOK_URL) {
      await fetch(process.env.ERROR_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
    }
  } catch (err) {
    console.error('[Error Report] Failed to send to monitoring service:', err);
  }
}

async function sendAlertToTeam(error: ErrorReport): Promise<void> {
  // Send alerts via Slack, Discord, email, etc.
  try {
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Critical Error Alert`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Error ID:* ${error.errorId}\n*Message:* ${error.message}\n*URL:* ${error.url}\n*Time:* ${error.timestamp}`,
              },
            },
          ],
        }),
      });
    }
  } catch (err) {
    console.error('[Error Report] Failed to send alert:', err);
  }
}
