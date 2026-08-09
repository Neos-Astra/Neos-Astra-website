"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      localStorage.setItem("admin_session_active", "true");
      setIsValid(true);
    } else if (status === "unauthenticated") {
      localStorage.removeItem("admin_session_active");
      router.push("/superadmin/login");
    }
  }, [status, session, router]);

  if (status === "loading" && !isValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090C14]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D2436] border-t-[#8B7CFF]"></div>
      </div>
    );
  }

  return <>{children}</>;
}
