"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      // Keep localStorage flag in sync (persists across browser restarts)
      localStorage.setItem("admin_session_active", "true");
      setIsValid(true);
    } else {
      // No valid next-auth session → sign out and go to login
      localStorage.removeItem("admin_session_active");
      signOut({ callbackUrl: "/superadmin/login" });
    }
  }, [status, session]);

  if (!isValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090C14]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D2436] border-t-[#8B7CFF]"></div>
      </div>
    );
  }

  return <>{children}</>;
}
