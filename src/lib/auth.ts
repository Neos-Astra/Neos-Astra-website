// src/lib/auth.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/superadmin/prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export const hashPassword = async (plain: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};

// JWT utilities – token valid for 7 days (adjust as needed)
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

// Helper to set HTTP‑only cookie
export const setAuthCookie = (res: any, token: string) => {
  // Support both NextApiResponse (setHeader) and NextResponse (headers API)
  if (typeof (res as any).setHeader === "function") {
    // NextApiResponse
    (res as any).setHeader("Set-Cookie", `auth=${token}; HttpOnly; Path=/; Max-Age=604800`);
  } else if (res?.headers?.set) {
    // NextResponse
    res.headers.set("Set-Cookie", `auth=${token}; HttpOnly; Path=/; Max-Age=604800`);
  }
};

// Middleware for protected API routes (server‑side)
export const requireStudent = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.cookies?.auth ?? "";
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthenticated" });
    return null;
  }
  const student = await prisma.student.findUnique({ where: { id: payload.id } });
  if (!student) {
    res.status(401).json({ error: "User not found" });
    return null;
  }
  return student;
};

export const requireAdmin = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.cookies?.auth ?? "";
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthenticated" });
    return null;
  }
  const admin = await prisma.adminUser.findUnique({ where: { id: payload.id } });
  if (!admin) {
    res.status(401).json({ error: "Admin not found" });
    return null;
  }
  return admin;
};
