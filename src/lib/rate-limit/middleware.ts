/**
 * Rate Limiting Middleware
 * Production-ready rate limiting with multiple strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory, RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import {
  RATE_LIMIT_TIERS,
  ENDPOINT_LIMITS,
  IP_RATE_LIMITS,
  RATE_LIMIT_MESSAGES,
  REDIS_CONFIG,
  RATE_LIMIT_HEADERS,
  WHITELISTED_IPS,
  BLACKLISTED_IPS,
  RateLimitConfig,
} from './config';

// Initialize Redis client (falls back to memory if Redis unavailable)
let redisClient: Redis | null = null;
let rateLimiters: Map<string, RateLimiterRedis | RateLimiterMemory> = new Map();

// Initialize Redis connection
const initRedis = () => {
  if (!redisClient && process.env.NODE_ENV === 'production') {
    try {
      redisClient = new Redis(REDIS_CONFIG);

      redisClient.on('error', (err) => {
        console.error('[Rate Limit] Redis error:', err);
        // Fall back to memory storage
        redisClient = null;
        initMemoryRateLimiters();
      });

      redisClient.on('connect', () => {
        console.log('[Rate Limit] Redis connected successfully');
        initRedisRateLimiters();
      });
    } catch (error) {
      console.error('[Rate Limit] Failed to initialize Redis:', error);
      initMemoryRateLimiters();
    }
  } else {
    initMemoryRateLimiters();
  }
};

// Initialize Redis-based rate limiters
const initRedisRateLimiters = () => {
  if (!redisClient) return;

  // IP-based rate limiter
  rateLimiters.set('ip-global', new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:ip:global',
    ...IP_RATE_LIMITS.global,
  }));

  rateLimiters.set('ip-burst', new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:ip:burst',
    ...IP_RATE_LIMITS.burst,
  }));

  // User tier rate limiters
  Object.entries(RATE_LIMIT_TIERS).forEach(([tier, config]) => {
    rateLimiters.set(`tier-${tier}`, new RateLimiterRedis({
      storeClient: redisClient!,
      keyPrefix: `rl:tier:${tier}`,
      ...config,
    }));
  });

  // Endpoint-specific rate limiters
  Object.entries(ENDPOINT_LIMITS).forEach(([endpoint, config]) => {
    const key = endpoint.replace(/\//g, ':');
    rateLimiters.set(`endpoint${key}`, new RateLimiterRedis({
      storeClient: redisClient!,
      keyPrefix: `rl:endpoint${key}`,
      ...config,
    }));
  });
};

// Initialize memory-based rate limiters (fallback)
const initMemoryRateLimiters = () => {
  // IP-based rate limiter
  rateLimiters.set('ip-global', new RateLimiterMemory({
    keyPrefix: 'rl:ip:global',
    ...IP_RATE_LIMITS.global,
  }));

  rateLimiters.set('ip-burst', new RateLimiterMemory({
    keyPrefix: 'rl:ip:burst',
    ...IP_RATE_LIMITS.burst,
  }));

  // User tier rate limiters
  Object.entries(RATE_LIMIT_TIERS).forEach(([tier, config]) => {
    rateLimiters.set(`tier-${tier}`, new RateLimiterMemory({
      keyPrefix: `rl:tier:${tier}`,
      ...config,
    }));
  });

  // Endpoint-specific rate limiters
  Object.entries(ENDPOINT_LIMITS).forEach(([endpoint, config]) => {
    const key = endpoint.replace(/\//g, ':');
    rateLimiters.set(`endpoint${key}`, new RateLimiterMemory({
      keyPrefix: `rl:endpoint${key}`,
      ...config,
    }));
  });
};

// Initialize rate limiters on module load
initRedis();

// Get client IP from request
const getClientIp = (req: NextRequest): string => {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return '127.0.0.1'; // Fallback for local development
};

// Get user tier from request (from JWT, session, etc.)
const getUserTier = async (req: NextRequest): Promise<keyof typeof RATE_LIMIT_TIERS> => {
  // Extract token from Authorization header or cookies
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || req.cookies.get('token')?.value;

  if (!token) {
    return 'anonymous';
  }

  try {
    // TODO: Verify JWT and extract user tier
    // For now, return a default tier
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // return decoded.tier || 'free';
    return 'free';
  } catch {
    return 'anonymous';
  }
};

// Get endpoint-specific config
const getEndpointConfig = (pathname: string): RateLimitConfig => {
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
};

// Create rate limit error response
const createRateLimitResponse = (
  message: string,
  rateLimiterRes?: RateLimiterRes,
  tier?: string
): NextResponse => {
  const headers = new Headers();

  if (rateLimiterRes) {
    headers.set(RATE_LIMIT_HEADERS.limit, rateLimiterRes.points.toString());
    headers.set(RATE_LIMIT_HEADERS.remaining, rateLimiterRes.remainingPoints.toString());
    headers.set(RATE_LIMIT_HEADERS.reset, new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
    headers.set(RATE_LIMIT_HEADERS.retryAfter, Math.round(rateLimiterRes.msBeforeNext / 1000).toString());
  }

  if (tier) {
    headers.set(RATE_LIMIT_HEADERS.tier, tier);
  }

  return NextResponse.json(
    {
      error: message,
      retryAfter: rateLimiterRes ? Math.round(rateLimiterRes.msBeforeNext / 1000) : 60,
    },
    {
      status: 429,
      headers,
    }
  );
};

// Main rate limiting middleware
export async function rateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const pathname = new URL(req.url).pathname;
  const clientIp = getClientIp(req);

  // Check if IP is blacklisted
  if (BLACKLISTED_IPS.includes(clientIp)) {
    return createRateLimitResponse(RATE_LIMIT_MESSAGES.ipBlocked);
  }

  // Skip rate limiting for whitelisted IPs
  if (WHITELISTED_IPS.includes(clientIp)) {
    return null;
  }

  try {
    // Apply IP-based rate limiting
    const ipGlobalLimiter = rateLimiters.get('ip-global');
    const ipBurstLimiter = rateLimiters.get('ip-burst');

    if (ipGlobalLimiter) {
      try {
        await ipGlobalLimiter.consume(clientIp);
      } catch (rateLimiterRes) {
        return createRateLimitResponse(RATE_LIMIT_MESSAGES.ipBlocked, rateLimiterRes as RateLimiterRes);
      }
    }

    if (ipBurstLimiter) {
      try {
        await ipBurstLimiter.consume(clientIp);
      } catch (rateLimiterRes) {
        return createRateLimitResponse(RATE_LIMIT_MESSAGES.tooManyRequests, rateLimiterRes as RateLimiterRes);
      }
    }

    // Apply user tier rate limiting
    const userTier = await getUserTier(req);
    const tierLimiter = rateLimiters.get(`tier-${userTier}`);

    if (tierLimiter) {
      const key = `${clientIp}:${userTier}`;
      try {
        await tierLimiter.consume(key);
      } catch (rateLimiterRes) {
        const message = userTier === 'anonymous' || userTier === 'free'
          ? RATE_LIMIT_MESSAGES.upgradeRequired
          : RATE_LIMIT_MESSAGES.tooManyRequests;
        return createRateLimitResponse(message, rateLimiterRes as RateLimiterRes, userTier);
      }
    }

    // Apply endpoint-specific rate limiting
    const endpointConfig = getEndpointConfig(pathname);
    const endpointKey = pathname.replace(/\//g, ':');
    let endpointLimiter = rateLimiters.get(`endpoint${endpointKey}`);

    // Create endpoint limiter if it doesn't exist
    if (!endpointLimiter && endpointConfig !== ENDPOINT_LIMITS.default) {
      endpointLimiter = redisClient
        ? new RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: `rl:endpoint${endpointKey}`,
            ...endpointConfig,
          })
        : new RateLimiterMemory({
            keyPrefix: `rl:endpoint${endpointKey}`,
            ...endpointConfig,
          });
      rateLimiters.set(`endpoint${endpointKey}`, endpointLimiter);
    }

    if (endpointLimiter || endpointConfig === ENDPOINT_LIMITS.default) {
      const limiter = endpointLimiter || rateLimiters.get('endpoint:default');
      if (limiter) {
        const key = `${clientIp}:${pathname}`;
        try {
          const rateLimiterRes = await limiter.consume(key);

          // Add rate limit info to response headers (for successful requests)
          if (req.headers.get('x-include-rate-limit-info') === 'true') {
            const headers = new Headers();
            headers.set(RATE_LIMIT_HEADERS.limit, rateLimiterRes.points.toString());
            headers.set(RATE_LIMIT_HEADERS.remaining, rateLimiterRes.remainingPoints.toString());
            headers.set(RATE_LIMIT_HEADERS.reset, new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
            headers.set(RATE_LIMIT_HEADERS.tier, userTier);

            // Store headers for later use in the response
            (req as any).rateLimitHeaders = headers;
          }
        } catch (rateLimiterRes) {
          // Determine appropriate error message based on endpoint
          let message = RATE_LIMIT_MESSAGES.tooManyRequests;
          if (pathname.includes('/auth')) {
            message = RATE_LIMIT_MESSAGES.authLimit;
          } else if (pathname.includes('/ai')) {
            message = RATE_LIMIT_MESSAGES.aiLimit;
          } else if (pathname.includes('/upload')) {
            message = RATE_LIMIT_MESSAGES.uploadLimit;
          }

          return createRateLimitResponse(message, rateLimiterRes as RateLimiterRes, userTier);
        }
      }
    }

    return null; // Request allowed
  } catch (error) {
    console.error('[Rate Limit] Error:', error);
    // In case of error, allow the request but log it
    return null;
  }
}

// Cleanup function for graceful shutdown
export const cleanupRateLimiter = async () => {
  if (redisClient) {
    await redisClient.quit();
  }
  rateLimiters.clear();
};