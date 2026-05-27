import { getUserByApiKey } from "../services/auth.service.js";

export const verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ message: "API key missing" });
    }

    const user = await getUserByApiKey(apiKey);

    req.user = {
  id: user.id,
  email: user.email,
};
    next();
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};