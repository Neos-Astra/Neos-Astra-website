// src/lib/auth.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";

export const hashPassword = async (plain: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};

// JWT utilities – token valid for 7 days
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
export const signToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
};

// Helper to set HTTP-only cookie
export const setAuthCookie = (res: any, token: string) => {
  if (typeof (res as any).setHeader === "function") {
    (res as any).setHeader("Set-Cookie", `auth=${token}; HttpOnly; Path=/; Max-Age=604800`);
  } else if (res?.headers?.set) {
    res.headers.set("Set-Cookie", `auth=${token}; HttpOnly; Path=/; Max-Age=604800`);
  }
};

