// server/authMiddleware.js
import jwt from "jsonwebtoken";
import { createResponse } from "./helper.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json(createResponse(false, "Access token required"));
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) {
        return res
          .status(403)
          .json(createResponse(false, "Invalid or expired token"));
      }
      req.user = user;
      next();
    },
  );
};
