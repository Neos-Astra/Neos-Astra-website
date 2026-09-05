// src/app/admin/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BookOpen, Users, ImageIcon, ArrowRight, Sparkles, GraduationCap } from "lucide-react";
import { prisma } from "@/superadmin/prisma/client";

import { unstable_cache } from "next/cache";

async function fetchStats() {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      courseCount,
      teamCount,
      enrollmentCount,
      todayEnrollmentCount,
      webLeadCount,
      todayWebLeadCount,
    ] = await Promise.all([
      prisma.course.count(),
      prisma.teamMember.count(),
      prisma.enrollment.count(),
      prisma.enrollment.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.inquiry.count(),
      prisma.inquiry.count({
        where: { createdAt: { gte: startOfToday } },
      }),
    ]);

    return {
      courseCount,
      teamCount,
      enrollmentCount,
      todayEnrollmentCount,
      webLeadCount,
      todayWebLeadCount,
    };
  } catch (error) {
    return {
      courseCount: 0,
      teamCount: 0,
      enrollmentCount: 0,
      todayEnrollmentCount: 0,
      webLeadCount: 0,
      todayWebLeadCount: 0,
    };
  }
}

const getDashboardStats = unstable_cache(
  fetchStats,
  ["admin-dashboard-stats-cache"],
  { revalidate: 20 }
);

export default async function StaffAdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  // If Super Admin visits /admin, redirect to /superadmin
  if (session.user.role === "SUPER_ADMIN") {
    redirect("/superadmin");
  }

  const {
    courseCount,
    teamCount,
    enrollmentCount,
    todayEnrollmentCount,
    webLeadCount,
    todayWebLeadCount,
  } = await getDashboardStats();
  const user = session.user;
  const firstName = user?.name || user?.email?.split("@")[0] || "Admin";

  const cards = [
    {
      label: "Web Leads / Enquiries",
      value: webLeadCount,
      todayValue: todayWebLeadCount,
      icon: Users,
      color: "#38BDF8",
      href: "/superadmin/inquiries",
      cta: "View web leads",
    },
    {
      label: "Official Enrollments",
      value: enrollmentCount,
      todayValue: todayEnrollmentCount,
      icon: GraduationCap,
      color: "#4ADE80",
      href: "/superadmin/enrollments",
      cta: "View enrollments",
    },
    {
      label: "Courses",
      value: courseCount,
      todayValue: null,
      icon: BookOpen,
      color: "#4DE8E0",
      href: "/superadmin/course",
      cta: "Manage courses",
    },
    {
      label: "Team Members",
      value: teamCount,
      todayValue: null,
      icon: Users,
      color: "#8B7CFF",
      href: "/superadmin/team",
      cta: "Manage team",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090C14] text-[#F3F6FB] px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Welcome banner */}
        <div className="mb-8 rounded-2xl border border-[#1D2436] bg-gradient-to-br from-[#0F1420] via-[#151C2C] to-[#090C14] p-6 sm:p-8">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#4DE8E04d] bg-[#4DE8E00d] px-3 py-1 font-mono text-[10px] text-[#4DE8E0]">
            <Sparkles className="h-3 w-3" /> STAFF ADMIN DASHBOARD
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F6FB] capitalize">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-sm text-[#8891A8]">
            You're signed in as <span className="font-semibold text-[#4DE8E0]">Staff Admin</span>. Here's a quick look at your site.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.label}
                href={card.href}
                className="group relative rounded-2xl border border-[#1D2436] bg-[#0F1420] p-5 transition-all hover:-translate-y-1 hover:border-[#4DE8E066] hover:shadow-[0_12px_30px_rgba(77,232,224,0.08)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${card.color}1a`, color: card.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {card.todayValue !== null && (
                    <span className="rounded-full border border-[#4DE8E0]/30 bg-[#4DE8E0]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#4DE8E0]">
                      Today: {card.todayValue}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-[#F3F6FB]">{card.value}</p>
                <p className="text-xs text-[#8891A8] mt-1">{card.label}</p>
                <div
                  className="mt-4 flex items-center gap-1.5 text-xs font-semibold group-hover:gap-2.5 transition-all"
                  style={{ color: card.color }}
                >
                  {card.cta} <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </a>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-[#1D2436] bg-[#0F1420] p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[#F3F6FB] mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="/superadmin/course"
              className="flex items-[#1D2436] items-center gap-3 rounded-xl border border-[#1D2436] bg-[#090C14] px-4 py-3 text-sm text-[#C7CCDA] hover:border-[#4DE8E066] hover:text-[#4DE8E0] transition-colors"
            >
              <BookOpen className="h-4 w-4" /> Manage courses
            </a>
            <a
              href="/superadmin/enrollments"
              className="flex items-center gap-3 rounded-xl border border-[#1D2436] bg-[#090C14] px-4 py-3 text-sm text-[#C7CCDA] hover:border-[#4ADE8066] hover:text-[#4ADE80] transition-colors"
            >
              <GraduationCap className="h-4 w-4" /> View enrollments
            </a>
            <a
              href="/superadmin/home-media"
              className="flex items-center gap-3 rounded-xl border border-[#1D2436] bg-[#090C14] px-4 py-3 text-sm text-[#C7CCDA] hover:border-[#64B5F666] hover:text-[#64B5F6] transition-colors"
            >
              <ImageIcon className="h-4 w-4" /> Upload a home photo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
