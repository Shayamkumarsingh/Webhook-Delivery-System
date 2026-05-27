export const rateLimitConfig = {
  // Default limits for different operations
  webhookDelivery: {
    capacity: 100,
    refillRate: 10, // 10 requests per second
  },
  apiCalls: {
    capacity: 1000,
    refillRate: 100, // 100 requests per second
  },
  eventCreation: {
    capacity: 50,
    refillRate: 5, // 5 events per second
  },
};
