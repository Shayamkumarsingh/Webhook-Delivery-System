import jwt from "jsonwebtoken";
import axios from "axios";

export const verifyAuth = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const authHeader = req.headers.authorization;

  try {
    if (apiKey) {
      const response = await axios.get(
        `${process.env.AUTH_SERVICE}/api/auth/me`,
        {
          headers: { "x-api-key": apiKey },
          timeout: 2000, 
        }
      );

      req.user = response.data.data;
    }

    else if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }

    else {
      return res.status(401).json({
        success: false,
        error: "No authentication credentials provided",
      });
    }

    //  Forward to services
    req.headers["x-user-id"] = req.user.id;

    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid authentication credentials",
    });
  }
};