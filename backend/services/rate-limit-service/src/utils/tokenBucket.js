import IORedis from "ioredis";

const redis = new IORedis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
});

redis.on("error", (err) => console.error("Redis error:", err));

class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
  }

  async consume(identifier, tokens = 1) {
    const now = Date.now();
    const key = `rate_limit:${identifier}`;
    const lastRefillKey = `rate_limit:${identifier}:lastRefill`;

    const [currentTokens, lastRefill] = await redis.mget(key, lastRefillKey);

    const last = parseInt(lastRefill) || now;
    const current = currentTokens !== null ? parseFloat(currentTokens) : this.capacity;  // ← fix here

    const timePassed = (now - last) / 1000;
    const refilled = Math.min(
      this.capacity,
      current + timePassed * this.refillRate
    );

    if (refilled >= tokens) {
      const newTokens = refilled - tokens;
      await redis.mset(key, newTokens, lastRefillKey, now);
      await redis.expire(key, 3600);
      await redis.expire(lastRefillKey, 3600);
      return { allowed: true, remaining: newTokens };
    }

    await redis.mset(key, refilled, lastRefillKey, now);
    await redis.expire(key, 3600);
    await redis.expire(lastRefillKey, 3600);
    return { allowed: false, remaining: refilled };
  }

  async getRemainingTokens(identifier) {
    const now = Date.now();
    const key = `rate_limit:${identifier}`;
    const lastRefillKey = `rate_limit:${identifier}:lastRefill`;

    const [currentTokens, lastRefill] = await redis.mget(key, lastRefillKey);

    const last = parseInt(lastRefill) || now;
    const current = currentTokens !== null ? parseFloat(currentTokens) : this.capacity; 

    const timePassed = (now - last) / 1000;
    return Math.min(this.capacity, current + timePassed * this.refillRate);
  }

  async reset(identifier) {
    const key = `rate_limit:${identifier}`;
    const lastRefillKey = `rate_limit:${identifier}:lastRefill`;
    await redis.del(key, lastRefillKey);
  }
}

export default TokenBucket;