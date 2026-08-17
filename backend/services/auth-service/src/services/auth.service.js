import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import crypto from 'crypto';
import { logger } from  "../../../../shared/index.js";
import { sendMessage } from "../../../../shared/kafka/producer.js";
import { TOPICS } from "../../../../shared/kafka/topics.js";

export const registerUser = async ({ email, password }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw { status: 400, message: "Email already in use" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    apiKey: crypto.randomBytes(16).toString("hex"),
  });

  await sendMessage(TOPICS.EVENTS, {
    _id: `usr_${user.id}`,
    id: `usr_${user.id}`,
    userId: user.id.toString(),
    email: user.email,
    type: "USER_CREATED",
    eventType: "user.created",
    payload: { id: user.id, email: user.email },
  });

  await sendMessage(TOPICS.USER, {
    userId: user.id.toString(),
    email: user.email,
    type: "USER_CREATED",
  });

  return {
    id: user.id,
    email: user.email,
    apiKey: user.apiKey,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw { status: 400, message: "Invalid credentials" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 400, message: "Invalid credentials" };

  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Save to DB
  await user.update({ 
    refreshToken,
    refreshTokenExpiry 
  });

  return {
    accessToken,
    refreshToken,
    apiKey: user.apiKey,
    user: { id: user.id, email: user.email, apiKey: user.apiKey }
  };
};

export const refreshAccessToken = async (refreshToken) => {
  const user = await User.findOne({ where: { refreshToken } });

  if (!user) throw { status: 401, message: "Invalid refresh token" };
  if (new Date() > user.refreshTokenExpiry) {
    throw { status: 401, message: "Refresh token expired" };
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  return { accessToken, apiKey: user.apiKey };
};

export const logoutUser = async (refreshToken) => {
  const user = await User.findOne({ where: { refreshToken } });
  if (user) {
    await user.update({ refreshToken: null, refreshTokenExpiry: null });
  }
};

export const getUserByApiKey = async (apiKey) => {
  const user = await User.findOne({ where: { apiKey } });

  if (!user) {
    throw { status: 401, message: "Invalid API Key" };
  }

  return user;
};

export const getUserByIdService = async (id) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  return {
    id: user.id,
    email: user.email,
    apiKey: user.apiKey,
  };
};
