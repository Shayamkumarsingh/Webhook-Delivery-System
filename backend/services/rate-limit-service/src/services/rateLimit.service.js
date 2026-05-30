import TokenBucket from "../utils/tokenBucket.js";

const DEFAULT_CAPACITY = 100;
const DEFAULT_REFILL_RATE = 10;

const bucket = new TokenBucket(DEFAULT_CAPACITY, DEFAULT_REFILL_RATE);

export const checkRateLimit = async (identifier, options = {}) => {
  const {
    capacity = DEFAULT_CAPACITY,
    refillRate = DEFAULT_REFILL_RATE,
  } = options;

  // Use per-request bucket config if different from default
  const b = (capacity === DEFAULT_CAPACITY && refillRate === DEFAULT_REFILL_RATE)
    ? bucket
    : new TokenBucket(capacity, refillRate);

  const { allowed, remaining } = await b.consume(identifier);

  return {
    allowed,
    remaining,
    limit: capacity,
    reset: Math.floor((capacity - remaining) / refillRate),
  };
};

export const resetRateLimit = async (identifier) => {
  await bucket.reset(identifier);
};