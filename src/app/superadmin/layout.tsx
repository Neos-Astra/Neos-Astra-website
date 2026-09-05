import { auth, signOut } from "@/auth";
import AutoLogout from "../components/AutoLogout";
import SessionGuard from "../components/SessionGuard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return <>{children}</>;
  }

  const user = session.user;
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  return (
    <SessionGuard>
      <div className="min-h-screen bg-[#090C14] text-[#F3F6FB]">
        <header className="sticky top-0 z-50 border-b border-[#1D2436] bg-[#0F1420]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <a href="/superadmin" className="font-mono text-sm font-bold tracking-wider text-[#4DE8E0] hover:opacity-80 transition-opacity">
                  NEOS ASTRA ADMIN
                </a>
                <div className="h-4 w-px bg-[#1D2436]" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#F3F6FB]">
                    {user.name || user.email}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                      isSuperAdmin
                        ? "bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/40"
                        : "bg-[#4DE8E0]/20 text-[#4DE8E0] border border-[#4DE8E0]/40"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Superadmin Navigation Links */}
              <nav className="hidden md:flex items-center gap-2 ml-4">
                <a
                  href={isSuperAdmin ? "/superadmin" : "/admin"}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8891A8] hover:bg-[#1D2436] hover:text-[#F3F6FB] transition-all"
                >
                  Dashboard
                </a>
                <a
                  href="/superadmin/course"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4DE8E0] bg-[#4DE8E010] border border-[#4DE8E033] hover:bg-[#4DE8E020] transition-all flex items-center gap-1.5"
                >
                  📚 Courses
                </a>
                <a
                  href="/superadmin/team"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8B7CFF] bg-[#8B7CFF10] border border-[#8B7CFF33] hover:bg-[#8B7CFF20] transition-all flex items-center gap-1.5"
                >
                  👥 Team
                </a>
                <a
                  href="/superadmin/home-media"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#F3A84D] bg-[#F3A84D10] border border-[#F3A84D33] hover:bg-[#F3A84D20] transition-all flex items-center gap-1.5"
                >
                  🖼️ Hero Images
                </a>
                <a
                  href="/superadmin/inquiries"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#FACC15] bg-[#FACC1510] border border-[#FACC1533] hover:bg-[#FACC1520] transition-all flex items-center gap-1.5"
                >
                  📩 Web Leads
                </a>
                <a
                  href="/superadmin/enrollments"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4ADE80] bg-[#4ADE8010] border border-[#4ADE8033] hover:bg-[#4ADE8020] transition-all flex items-center gap-1.5"
                >
                  🎓 Official Enrollments
                </a>
                {isSuperAdmin && (
                  <a
                    href="/superadmin/career"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#EC4899] bg-[#EC489910] border border-[#EC489933] hover:bg-[#EC489920] transition-all flex items-center gap-1.5"
                  >
                    💼 Careers
                  </a>
                )}
                {isSuperAdmin && (
                  <a
                    href="/superadmin/admins"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#F43F5E] bg-[#F43F5E10] border border-[#F43F5E33] hover:bg-[#F43F5E20] transition-all flex items-center gap-1.5"
                  >
                    🔐 Manage Admins
                  </a>
                )}
              </nav>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-[#1D2436] bg-[#090C14] px-4 py-2 text-xs font-semibold text-[#8891A8] transition-colors hover:border-red-500/50 hover:text-red-400"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        <AutoLogout />
        <main>{children}</main>
      </div>
    </SessionGuard>
  );
}
