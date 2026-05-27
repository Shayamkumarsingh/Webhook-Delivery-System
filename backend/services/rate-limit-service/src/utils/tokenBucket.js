class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate; // tokens per second
    this.lastRefill = Date.now();
  }

  async consume(tokens = 1) {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // convert to seconds

    // Refill tokens
    this.tokens = Math.min(
      this.capacity,
      this.tokens + timePassed * this.refillRate
    );

    this.lastRefill = now;

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  async getRemainingTokens() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;

    this.tokens = Math.min(
      this.capacity,
      this.tokens + timePassed * this.refillRate
    );

    this.lastRefill = now;

    return this.tokens;
  }
}

export default TokenBucket;
