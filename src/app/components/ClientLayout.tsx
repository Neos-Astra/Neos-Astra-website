"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import React from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Don't show global navbar and footer on any /superadmin route
  const isAdminRoute = pathname?.startsWith("/superadmin") || pathname?.startsWith("/admin");

  React.useEffect(() => {
    if (!isAdminRoute) {
      localStorage.removeItem("admin_session_active");
    }
  }, [isAdminRoute]);

  return (
    <>
      {!isAdminRoute && <Navbar />}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  );
}
