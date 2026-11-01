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
  CreditCard,
  Briefcase,
  Zap,
  FileCheck,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

/* ─── Nav config ──────────────────────────────────────────── */
const ALL_NAV = [
  { label: "Dashboard",    href: "/superadmin",              icon: LayoutDashboard, color: "#4DE8E0", superOnly: false },
  { label: "Web Leads",    href: "/superadmin/inquiries",    icon: FileText,        color: "#FACC15", superOnly: false },
  { label: "Enrollments",  href: "/superadmin/enrollments",  icon: GraduationCap,   color: "#4ADE80", superOnly: false },
  { label: "Fee & Pay",    href: "/superadmin/payments",     icon: CreditCard,      color: "#38BDF8", superOnly: false },
  { label: "Pay Proofs",   href: "/superadmin/payment-submissions", icon: FileCheck, color: "#A78BFA", superOnly: false },
  { label: "Courses",      href: "/superadmin/course",       icon: BookOpen,        color: "#8B7CFF", superOnly: false },
  { label: "Team",         href: "/superadmin/team",         icon: Users,           color: "#F472B6", superOnly: false },
  { label: "Home Photos",  href: "/superadmin/home-media",   icon: ImageIcon,       color: "#60A5FA", superOnly: false },
  { label: "Careers",      href: "/superadmin/career",       icon: Briefcase,       color: "#EC4899", superOnly: true  },
  { label: "Manage Admins",href: "/superadmin/admins",       icon: ShieldCheck,     color: "#F43F5E", superOnly: true  },
];

/* ─── Component ───────────────────────────────────────────── */
export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname   = usePathname();
  const { data: session } = useSession();
  const [sideOpen, setSideOpen] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const role        = session?.user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const userEmail   = session?.user?.email || "";
  const userName    = session?.user?.name  || userEmail.split("@")[0] || "Admin";
  const initials    = userName.slice(0, 2).toUpperCase();

  const navItems = ALL_NAV.filter(n => !n.superOnly || isSuperAdmin);
  const activeItem = navItems.find(n => n.href === pathname);
  const accentColor = activeItem?.color || "#4DE8E0";

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setSideOpen(false); }, [pathname]);

  /* close sidebar on outside click */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) setSideOpen(false);
  };

  const SIDEBAR_W = 260;

  return (
    <>
      {/* ══════════════════════════════════════════
          GLOBAL STYLES
      ══════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        /* scrollbar */
        .nas-nav::-webkit-scrollbar { width: 4px; }
        .nas-nav::-webkit-scrollbar-track { background: transparent; }
        .nas-nav::-webkit-scrollbar-thumb { background: #1D2436; border-radius: 4px; }

        /* keyframes */
        @keyframes nas-glow-pulse {
          0%,100% { box-shadow: 0 0 12px var(--ac); }
          50%      { box-shadow: 0 0 28px var(--ac); }
        }
        @keyframes nas-slide-in {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0);     }
        }
        @keyframes nas-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes nas-spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes nas-dot-blink {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.5; transform:scale(.8); }
        }
        @keyframes nas-bar-grow {
          from { height: 0; opacity: 0; }
          to   { height: 22px; opacity: 1; }
        }
        @keyframes nas-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes nas-aurora {
          0%,100% { opacity:.6; transform:translateY(0px) scale(1); }
          50%     { opacity:.9; transform:translateY(-8px) scale(1.04); }
        }
        @keyframes nas-float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-4px); }
        }

        /* Nav item hover */
        .nas-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          color: #8891A8;
          transition: color .2s, background .2s, transform .15s;
          cursor: pointer;
          border: 1px solid transparent;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }
        .nas-nav-item::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          opacity: 0;
          transition: opacity .2s;
          background: var(--item-bg, rgba(255,255,255,.04));
        }
        .nas-nav-item:hover::before { opacity: 1; }
        .nas-nav-item:hover { color: #F3F6FB !important; transform: translateX(3px); }
        .nas-nav-item:active { transform: translateX(1px) scale(.98); }

        .nas-nav-item.active {
          color: var(--ac) !important;
          background: color-mix(in srgb, var(--ac) 10%, transparent);
          border-color: color-mix(in srgb, var(--ac) 25%, transparent);
          font-weight: 600;
        }
        .nas-nav-item.active .nas-nav-icon {
          filter: drop-shadow(0 0 6px var(--ac));
        }
        .nas-nav-item.active::after {
          content: '';
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%);
          width: 3px;
          border-radius: 0 4px 4px 0;
          background: var(--ac);
          animation: nas-bar-grow .3s ease forwards;
          box-shadow: 2px 0 8px var(--ac);
        }

        /* topbar shimmer brand text */
        .nas-brand-shimmer {
          background: linear-gradient(90deg, #4DE8E0 20%, #8B7CFF 40%, #4DE8E0 60%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: nas-shimmer 4s linear infinite;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: .08em;
          font-family: 'Inter', monospace;
        }

        /* glow avatar ring */
        .nas-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4DE8E0, #8B7CFF);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #090C14;
          position: relative; flex-shrink: 0;
          box-shadow: 0 0 0 2px #090C14, 0 0 0 3.5px #4DE8E066;
          transition: box-shadow .3s;
          animation: nas-float 3s ease-in-out infinite;
        }
        .nas-avatar:hover {
          box-shadow: 0 0 0 2px #090C14, 0 0 0 4px #4DE8E0aa, 0 0 20px #4DE8E044;
        }

        /* online dot */
        .nas-online-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #4ADE80;
          border: 2px solid #090C14;
          position: absolute; bottom: 1px; right: 1px;
          animation: nas-dot-blink 2s ease-in-out infinite;
        }

        /* hamburger button */
        .nas-hamburger {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 11px;
          border: 1px solid #1D2436;
          background: linear-gradient(135deg, #0F1420, #0B0F19);
          color: #8891A8; cursor: pointer;
          transition: all .2s;
          box-shadow: 0 2px 8px rgba(0,0,0,.4);
        }
        .nas-hamburger:hover {
          border-color: #4DE8E066;
          color: #4DE8E0;
          box-shadow: 0 0 16px #4DE8E022, 0 2px 8px rgba(0,0,0,.4);
          transform: scale(1.05);
        }
        .nas-hamburger:active { transform: scale(.95); }

        /* sign-out */
        .nas-signout {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 9px;
          border: none; background: transparent; color: #8891A8;
          cursor: pointer; transition: all .18s;
          flex-shrink: 0;
        }
        .nas-signout:hover {
          background: rgba(239,68,68,.14);
          color: #f87171;
          transform: rotate(-8deg) scale(1.1);
        }

        /* mobile backdrop */
        .nas-backdrop {
          position: fixed; inset: 0; z-index: 45;
          background: rgba(5,7,13,.8);
          backdrop-filter: blur(6px);
          animation: nas-fade-in .25s ease;
        }

        /* page entry */
        .nas-page-enter {
          animation: nas-fade-in .35s ease;
        }
      `}</style>

      {/* ══════════════════════════════════════════
          ROOT
      ══════════════════════════════════════════ */}
      <div style={{
        display: "flex", minHeight: "100vh",
        background: "#090C14", color: "#F3F6FB",
        fontFamily: "'Inter', sans-serif",
      }}>

        {/* ══ MOBILE BACKDROP ══ */}
        {sideOpen && (
          <div
            ref={overlayRef}
            className="nas-backdrop"
            onClick={handleOverlayClick}
          />
        )}

        {/* ══════════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════════ */}
        <aside style={{
          position: "fixed",
          top: 0, bottom: 0, left: 0,
          zIndex: 50,
          width: SIDEBAR_W,
          background: "linear-gradient(180deg, #0B0F19 0%, #0D1121 100%)",
          borderRight: "1px solid #1D2436",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          /* mobile: slide in/out */
          transform: sideOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .32s cubic-bezier(.4,0,.2,1)",
          /* desktop: always visible */
        }}
          /* override on desktop with CSS */
          className="nas-sidebar"
        >
          {/* decorative glow blob top-right */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 160, height: 160, borderRadius: "50%",
            background: "radial-gradient(circle, #4DE8E022 0%, transparent 70%)",
            pointerEvents: "none",
            animation: "nas-aurora 5s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: 80, left: -40,
            width: 120, height: 120, borderRadius: "50%",
            background: "radial-gradient(circle, #8B7CFF18 0%, transparent 70%)",
            pointerEvents: "none",
            animation: "nas-aurora 7s ease-in-out infinite reverse",
          }} />

          {/* ── Logo ── */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "22px 20px 18px",
            borderBottom: "1px solid #1D2436",
            position: "relative", zIndex: 1,
          }}>
            {/* animated logo icon */}
            <div style={{
              width: 40, height: 40, borderRadius: 13,
              background: "linear-gradient(135deg, #4DE8E0, #8B7CFF)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#090C14",
              boxShadow: "0 4px 20px rgba(77,232,224,.35)",
              flexShrink: 0,
              position: "relative",
            }}>
              <Zap size={19} strokeWidth={2.5} />
              {/* spinning ring */}
              <div style={{
                position: "absolute", inset: -4,
                borderRadius: 17,
                border: "1.5px solid transparent",
                borderTopColor: "#4DE8E066",
                borderRightColor: "#8B7CFF44",
                animation: "nas-spin-slow 4s linear infinite",
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: "#F3F6FB", letterSpacing: "-.01em" }}>
                Neos Astra
              </p>
              <p style={{ margin: 0, fontSize: 10, color: "#8891A8", fontFamily: "monospace", letterSpacing: ".05em" }}>
                Admin Console
              </p>
            </div>
            {/* close btn (mobile) */}
            <button
              onClick={() => setSideOpen(false)}
              aria-label="Close menu"
              className="nas-hamburger"
              style={{ width: 34, height: 34 }}
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Nav ── */}
          <nav className="nas-nav" style={{
            flex: 1, overflowY: "auto",
            padding: "12px 10px",
            display: "flex", flexDirection: "column", gap: 2,
            position: "relative", zIndex: 1,
          }}>
            {/* section label */}
            <p style={{ fontSize: 10, fontWeight: 700, color: "#4DE8E044", letterSpacing: ".12em", margin: "4px 6px 8px", fontFamily: "monospace" }}>
              NAVIGATION
            </p>

            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon   = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nas-nav-item ${active ? "active" : ""}`}
                  style={{ "--ac": item.color, "--item-bg": `${item.color}08` } as React.CSSProperties}
                >
                  <span className="nas-nav-icon" style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: active ? `${item.color}18` : "rgba(255,255,255,.04)",
                    color: active ? item.color : "#6B7280",
                    transition: "all .2s",
                    border: active ? `1px solid ${item.color}33` : "1px solid transparent",
                  }}>
                    <Icon size={16} />
                  </span>
                  <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>
                  {active && (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: item.color,
                      boxShadow: `0 0 8px ${item.color}`,
                      animation: "nas-dot-blink 2s ease-in-out infinite",
                    }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── User card ── */}
          <div style={{
            padding: "12px 10px",
            borderTop: "1px solid #1D2436",
            position: "relative", zIndex: 1,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 13,
              background: "linear-gradient(135deg, #0F1420, #151C2C)",
              border: "1px solid #1D2436",
            }}>
              <div style={{ position: "relative" }}>
                <div className="nas-avatar">{initials}</div>
                <div className="nas-online-dot" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#F3F6FB", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userName}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: "#4DE8E0", fontFamily: "monospace" }}>
                  {isSuperAdmin ? "⚡ Super Admin" : "👤 Admin"}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="nas-signout"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </aside>

        {/* ══════════════════════════════════════════
            MAIN AREA
        ══════════════════════════════════════════ */}
        <div className="nas-main" style={{
          flex: 1, minWidth: 0,
          display: "flex", flexDirection: "column",
          /* desktop: offset by sidebar */
        }}>

          {/* ── TOPBAR ── */}
          <header style={{
            position: "sticky", top: 0, zIndex: 40,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px", height: 60,
            background: "rgba(9,12,20,0.88)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid #1D2436",
          }}>
            {/* left: page title */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* page title with accent underline */}
              <div>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#F3F6FB", letterSpacing: "-.01em" }}>
                  {title}
                </h1>
                <div style={{
                  height: 2, borderRadius: 2, marginTop: 2,
                  background: `linear-gradient(90deg, ${accentColor}, transparent)`,
                  width: 48, transition: "width .4s",
                }} />
              </div>
            </div>

            {/* right: brand + status chip */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* animated brand */}
              <span className="nas-brand-shimmer">NEOS ASTRA</span>

              {/* status chip */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 20,
                background: "linear-gradient(135deg, #0F1420, #151C2C)",
                border: "1px solid #1D2436",
                fontSize: 10.5, fontWeight: 700,
                color: "#4ADE80", fontFamily: "monospace",
                letterSpacing: ".06em",
                boxShadow: "0 0 12px #4ADE8012",
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#4ADE80",
                  boxShadow: "0 0 6px #4ADE80",
                  animation: "nas-dot-blink 2s ease-in-out infinite",
                  display: "inline-block",
                }} />
                {isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
              </div>
            </div>
          </header>

          {/* ── Page content ── */}
          <main className="nas-page-enter" style={{ flex: 1, padding: "24px" }}>
            {children}
          </main>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RESPONSIVE — desktop sidebar always open
      ══════════════════════════════════════════ */}
      <style>{`
        @media (min-width: 1024px) {
          .nas-sidebar {
            transform: translateX(0) !important;
          }
          .nas-main {
            margin-left: ${SIDEBAR_W}px !important;
          }
          /* hide the close button inside sidebar on desktop */
          .nas-sidebar .nas-hamburger {
            display: none !important;
          }
          /* on desktop, never show the mobile backdrop */
          .nas-backdrop {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
