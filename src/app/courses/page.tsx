import CoursesComponent from "../components/courses/CoursesComponent";
import { prisma } from "@/superadmin/prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Our Courses | Neos Astra - School of Innovation",
  description: "Master cutting-edge technologies in Robotics, AI, IoT, and Aerospace with hands-on projects.",
};

// ISR: Cache for 1 hour at Vercel Edge CDN, background revalidation
export const revalidate = 3600;

export default async function CoursesPage() {
  let courses: any[] = [];
  try {
    courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to load courses on server:", error);
  }

  return <CoursesComponent courses={courses} />;
}
