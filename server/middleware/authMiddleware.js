import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or invalid",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user to request
    req.user = {
      _id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

export default authMiddleware;
