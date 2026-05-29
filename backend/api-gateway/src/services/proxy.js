import { createProxyMiddleware } from "http-proxy-middleware";
import { logger } from "../../../shared/utils/logger.js";

// proxy.js
export const createProxy = (target, pathPrefix) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => `/api/${pathPrefix}${path}`, // ✅ dynamic
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.headers["x-user-id"]) {
          proxyReq.setHeader("x-user-id", req.headers["x-user-id"]);
        }
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      error: (err, req, res) => {
        logger.error("Proxy error", err.message);
        res.status(500).json({ error: "Service unavailable" });
      },
    },
  });
};