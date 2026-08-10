"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ImageIcon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
  FileText,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
  { label: "Web Leads", href: "/superadmin/inquiries", icon: FileText },
  { label: "Official Enrollments", href: "/superadmin/enrollments", icon: GraduationCap },
  { label: "Courses", href: "/superadmin/course", icon: BookOpen },
  { label: "Team", href: "/superadmin/team", icon: Users },
  { label: "Home Photos", href: "/superadmin/home-media", icon: ImageIcon },
  { label: "Manage Admins", href: "/superadmin/admins", icon: ShieldCheck },
];

export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = session?.user?.role;
  const initials = session?.user?.email?.charAt(0).toUpperCase() || "A";

  const SidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#4DE8E0] to-[#8B7CFF]">
          <ShieldCheck className="h-5 w-5 text-[#090C14]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#F3F6FB] leading-tight">Neos Astra</p>
          <p className="text-[10px] text-[#8891A8] font-mono">Admin Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#4DE8E0]/10 text-[#4DE8E0] border border-[#4DE8E0]/20"
                  : "text-[#8891A8] hover:bg-[#0F1420] hover:text-[#F3F6FB] border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-[#1D2436] p-3">
        <div className="flex items-center gap-3 rounded-lg bg-[#0F1420] p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4DE8E0] to-[#8B7CFF] text-xs font-bold text-[#090C14]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[#F3F6FB]">
              {session?.user?.email || "Admin"}
            </p>
            <p className="text-[10px] text-[#8891A8]">{role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            aria-label="Logout"
            className="text-[#8891A8] hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090C14] text-[#F3F6FB]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#1D2436] bg-[#0B0F19] lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#0B0F19] border-r border-[#1D2436]">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#1D2436] bg-[#090C14]/90 backdrop-blur-md px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-[#8891A8] hover:text-[#F3F6FB] lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-[#F3F6FB]">{title}</h1>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}