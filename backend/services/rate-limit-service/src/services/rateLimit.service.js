import TokenBucket from "../utils/tokenBucket.js";

// Store token buckets for different identifiers (user IDs, IP addresses, etc.)
const buckets = new Map();

const DEFAULT_CAPACITY = 100;
const DEFAULT_REFILL_RATE = 10; // 10 tokens per second

export const checkRateLimit = async (identifier, options = {}) => {
  const {
    capacity = DEFAULT_CAPACITY,
    refillRate = DEFAULT_REFILL_RATE,
  } = options;

  // Get or create bucket for this identifier
  if (!buckets.has(identifier)) {
    buckets.set(identifier, new TokenBucket(capacity, refillRate));
  }

  const bucket = buckets.get(identifier);

  const canProceed = await bucket.consume();
  const remainingTokens = await bucket.getRemainingTokens();

  return {
    allowed: canProceed,
    remaining: remainingTokens,
    limit: capacity,
    reset: Math.floor((capacity - remainingTokens) / refillRate),
  };
};

export const resetRateLimit = (identifier) => {
  buckets.delete(identifier);
};

// Clean up old buckets periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [identifier, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > 3600000) { // 1 hour
      buckets.delete(identifier);
    }
  }
}, 300000); // Check every 5 minutes
