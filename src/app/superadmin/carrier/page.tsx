import { auth } from "@/superadmin/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/superadmin/prisma/client";
import CarrierManagementClient from "./carrier-management";

export const metadata = {
  title: "Manage Job Openings | Super Admin | Neos Astra",
};

async function getJobs() {
  try {
    const jobs = await prisma.jobOpening.findMany({
      orderBy: { createdAt: "desc" },
    });
    return jobs;
  } catch (error) {
    console.error("Failed to fetch jobs for superadmin:", error);
    return [];
  }
}

export default async function SuperAdminCarrierPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/superadmin/login");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/superadmin/unauthorized");
  }

  const jobs = await getJobs();

  return (
    <div className="min-h-screen bg-[#090C14] text-[#F3F6FB] p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <CarrierManagementClient initialJobs={jobs} />
      </div>
    </div>
  );
}
