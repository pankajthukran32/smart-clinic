import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import logger from "../services/logger.js";

// ✅ Helper to generate access + refresh tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// 🧩 Register Controller
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role });

    logger.info(`User registered: ${user.email}`);
    return res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    logger.error("Registration failed", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 🔐 Login Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    logger.error("Login failed", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 🚪 Logout Controller
export const logoutUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      user.refreshToken = null;
      await user.save();
      logger.info(`User logged out: ${email}`);
    }

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    logger.error("Logout failed", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 🔄 Refresh Token Controller
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "No token provided" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    logger.info(`Token refreshed for: ${user.email}`);

    return res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    logger.error("Token refresh failed", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
