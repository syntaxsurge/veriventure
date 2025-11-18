/**
 * Rate Limiting Configuration
 * Production-ready rate limiting setup for API protection
 */

export interface RateLimitConfig {
  points: number; // Number of requests
  duration: number; // Per seconds
  blockDuration?: number; // Block duration in seconds
  keyPrefix?: string;
}

// Rate limit tiers based on user subscription
export const RATE_LIMIT_TIERS = {
  anonymous: {
    points: 10,
    duration: 60, // 10 requests per minute
    blockDuration: 60 * 5, // 5 minutes block
  },
  free: {
    points: 30,
    duration: 60, // 30 requests per minute
    blockDuration: 60 * 3, // 3 minutes block
  },
  starter: {
    points: 100,
    duration: 60, // 100 requests per minute
    blockDuration: 60 * 2, // 2 minutes block
  },
  pro: {
    points: 500,
    duration: 60, // 500 requests per minute
    blockDuration: 60, // 1 minute block
  },
  enterprise: {
    points: 2000,
    duration: 60, // 2000 requests per minute
    blockDuration: 30, // 30 seconds block
  },
} as const;

// Endpoint-specific rate limits
export const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints - stricter limits
  '/api/auth/login': {
    points: 5,
    duration: 60 * 15, // 5 attempts per 15 minutes
    blockDuration: 60 * 30, // 30 minutes block
  },
  '/api/auth/register': {
    points: 3,
    duration: 60 * 60, // 3 registrations per hour
    blockDuration: 60 * 60, // 1 hour block
  },
  '/api/auth/reset-password': {
    points: 3,
    duration: 60 * 60, // 3 attempts per hour
    blockDuration: 60 * 60, // 1 hour block
  },

  // AI endpoints - resource intensive
  '/api/ai/generate': {
    points: 10,
    duration: 60 * 5, // 10 requests per 5 minutes
    blockDuration: 60 * 10, // 10 minutes block
  },
  '/api/ai/pitch-deck': {
    points: 5,
    duration: 60 * 60, // 5 generations per hour
    blockDuration: 60 * 30, // 30 minutes block
  },
  '/api/ai/business-plan': {
    points: 3,
    duration: 60 * 60, // 3 generations per hour
    blockDuration: 60 * 30, // 30 minutes block
  },
  '/api/ai/truth-alignment': {
    points: 20,
    duration: 60 * 5, // 20 checks per 5 minutes
    blockDuration: 60 * 5, // 5 minutes block
  },

  // DKG endpoints
  '/api/dkg/publish': {
    points: 30,
    duration: 60, // 30 publishes per minute
    blockDuration: 60 * 2, // 2 minutes block
  },
  '/api/dkg/verify': {
    points: 50,
    duration: 60, // 50 verifications per minute
    blockDuration: 60, // 1 minute block
  },

  // Invoice endpoints
  '/api/invoices/create': {
    points: 10,
    duration: 60 * 5, // 10 invoices per 5 minutes
    blockDuration: 60 * 10, // 10 minutes block
  },
  '/api/invoices/pay': {
    points: 5,
    duration: 60, // 5 payments per minute
    blockDuration: 60 * 5, // 5 minutes block
  },

  // Achievement endpoints
  '/api/achievements/mint': {
    points: 5,
    duration: 60 * 10, // 5 mints per 10 minutes
    blockDuration: 60 * 15, // 15 minutes block
  },

  // Search endpoints
  '/api/search': {
    points: 30,
    duration: 60, // 30 searches per minute
    blockDuration: 60, // 1 minute block
  },

  // File upload endpoints
  '/api/upload': {
    points: 10,
    duration: 60 * 5, // 10 uploads per 5 minutes
    blockDuration: 60 * 10, // 10 minutes block
  },

  // Webhook endpoints - allow more for external services
  '/api/webhooks/*': {
    points: 100,
    duration: 60, // 100 webhook calls per minute
    blockDuration: 60, // 1 minute block
  },

  // Public endpoints - more lenient
  '/api/public/*': {
    points: 60,
    duration: 60, // 60 requests per minute
    blockDuration: 60, // 1 minute block
  },

  // Default for all other endpoints
  default: {
    points: 30,
    duration: 60, // 30 requests per minute
    blockDuration: 60 * 2, // 2 minutes block
  },
};

// IP-based rate limiting for DDoS protection
export const IP_RATE_LIMITS = {
  global: {
    points: 1000,
    duration: 60, // 1000 requests per minute per IP
    blockDuration: 60 * 10, // 10 minutes block
  },
  burst: {
    points: 100,
    duration: 1, // 100 requests per second (burst protection)
    blockDuration: 60, // 1 minute block
  },
};

// Rate limit error messages
export const RATE_LIMIT_MESSAGES = {
  tooManyRequests: 'Too many requests. Please try again later.',
  authLimit: 'Too many authentication attempts. Please wait before trying again.',
  aiLimit: 'AI generation limit reached. Please upgrade your plan for more requests.',
  uploadLimit: 'Upload limit reached. Please wait before uploading more files.',
  ipBlocked: 'Your IP has been temporarily blocked due to excessive requests.',
  upgradeRequired: 'Rate limit exceeded. Please upgrade to a higher plan for increased limits.',
};

// Redis configuration for distributed rate limiting
export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  enableOfflineQueue: false,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// Headers to include in rate limit responses
export const RATE_LIMIT_HEADERS = {
  limit: 'X-RateLimit-Limit',
  remaining: 'X-RateLimit-Remaining',
  reset: 'X-RateLimit-Reset',
  retryAfter: 'Retry-After',
  tier: 'X-RateLimit-Tier',
};

// Whitelist IPs (internal services, monitoring, etc.)
export const WHITELISTED_IPS = process.env.WHITELISTED_IPS?.split(',') || [];

// Blacklist IPs (known bad actors)
export const BLACKLISTED_IPS = process.env.BLACKLISTED_IPS?.split(',') || [];