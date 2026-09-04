import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { researchId, date, answers } = body;

    if (!answers) {
      return NextResponse.json(
        { error: "Survey answers are required." },
        { status: 400 }
      );
    }

    const participantRole = answers.A4 || "";
    const orgSize = answers.A6 || "";

    const response = await prisma.ngoSurveyResponse.create({
      data: {
        researchId: String(researchId || "").trim(),
        date: String(date || "").trim(),
        participantRole: String(participantRole),
        orgSize: String(orgSize),
        answers: answers,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: response.id,
        message: "Survey response recorded successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Survey submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit survey. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const responses = await prisma.ngoSurveyResponse.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(responses);
  } catch (error) {
    console.error("Fetch survey responses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch survey responses." },
      { status: 500 }
    );
  }
}
