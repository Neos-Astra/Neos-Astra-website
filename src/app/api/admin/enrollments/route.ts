// src/app/api/admin/enrollments/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  // @ts-ignore – Next.js serverless env does not type req
  const { req: httpReq, res: httpRes } = req as any;
  const admin = await requireAdmin(httpReq, httpRes);
  if (!admin) return; // requireAdmin already sent 401

  const enrollments = await prisma.enrollment.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      registrationNo: true,
      studentName: true,
      studentEmail: true,
      studentPhone: true,
      college: true,
      branch: true,
      courseTitle: true,
      coursePrice: true,
      createdAt: true,
    },
  });
  return NextResponse.json(enrollments);
}
