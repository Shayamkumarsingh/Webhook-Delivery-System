import axios from "axios";

export const rateLimitMiddleware = async (req, res, next) => {
  try {
    const identifier = req.user?.id || req.ip;

    const response = await axios.post(
      `${process.env.RATE_LIMIT_SERVICE}/check`,
      {
        identifier,
        options: {
          capacity: 100,
          refillRate: 10,
        },
      }
    );

    const { allowed, remaining, limit } = response.data;

    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", Math.floor(remaining));

    if (!allowed) {
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: response.data.reset,
      });
    }

    next();
  } catch (err) {
    // If rate limit service is down, allow request through
    console.error("Rate limit service error:", err.message);
    next();
  }
};