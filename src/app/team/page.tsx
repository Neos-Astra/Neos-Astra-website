import TeamComponent, { STATIC_TEAM_MEMBERS } from "../components/team/TeamComponent";
import { prisma } from "@/superadmin/prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meet Our Team | Neos Astra - School of Innovation",
  description: "Driven by passion, innovation, and industry expertise — our team of engineers, researchers, and mentors.",
};

// ISR: Cache for 24 hours at Vercel Edge CDN, background revalidation
export const revalidate = 86400;

export default async function TeamPage() {
  let members: any[] = [];
  try {
    members = await prisma.teamMember.findMany({
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Failed to load team on server:", error);
  }

  return <TeamComponent members={members.length > 0 ? members : STATIC_TEAM_MEMBERS} />;
}
