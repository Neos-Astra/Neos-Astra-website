import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CarrierClient from "./carrier-client";
import { prisma } from "@/superadmin/prisma/client";

export const metadata = {
  title: "Carrier & Job Openings | Neos Astra - School of Innovation",
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
    console.error("Failed to fetch jobs for public carrier page:", error);
    return [];
  }
}

export default async function CarrierPage() {
  const initialJobs = await getJobOpenings();

  return (
    <div className="min-h-screen bg-[#090C14] text-[#F3F6FB] flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <CarrierClient initialJobs={initialJobs} />
      </main>
      <Footer />
    </div>
  );
}
