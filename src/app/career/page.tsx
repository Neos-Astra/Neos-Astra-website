import CareerClient from "./career-client";
import { prisma } from "@/superadmin/prisma/client";

export const metadata = {
  title: "Career & Job Openings | Neos Astra - School of Innovation",
  description: "Join Neos Astra in shaping the future of AI, Robotics, and STEM education. Explore open career opportunities.",
};

async function getJobOpenings() {
  try {
    const jobs = await prisma.jobOpening.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return jobs;
  } catch (error) {
    console.error("Failed to fetch jobs for public career page:", error);
    return [];
  }
}

export default async function CareerPage() {
  const initialJobs = await getJobOpenings();

  return (
    <main>
      <CareerClient initialJobs={initialJobs} />
    </main>
  );
}
