import { createProxyMiddleware } from "http-proxy-middleware";
import { logger } from "shared";


import { metricsMiddleware } from "shared/middleware/metrics.middleware.js";
import { register } from "shared/utils/metrics.js";

app.use(metricsMiddleware);

//  Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});




export const createProxy = (target) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,

    //  Forward headers properly
    onProxyReq: (proxyReq, req) => {
      if (req.headers["x-user-id"]) {
        proxyReq.setHeader("x-user-id", req.headers["x-user-id"]);
      }
    },

    //  Logging
    onError: (err, req, res) => {
      logger.error("Proxy error", err.message);
      res.status(500).json({ error: "Service unavailable" });
    },
  });
};