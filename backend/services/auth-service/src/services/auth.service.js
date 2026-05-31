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

  // PUBLISH USER EVENT to Kafka so that other services can consume it
  await sendMessage(TOPICS.EVENTS, {
    userId: user.id.toString(),
    email: user.email,
    type: "USER_CREATED",
    eventType: "user.created",
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
  if (!user) {
    throw { status: 400, message: "Invalid credentials" };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 400, message: "Invalid credentials" };
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    }
  };
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
  };
};
