"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function AutoLogout() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Set timeout for 2 hours of inactivity (7,200,000 ms)
      timeoutId = setTimeout(() => {
        // Sign out due to inactivity
        signOut({ callbackUrl: "/superadmin/login" });
      }, 2 * 60 * 60 * 1000);
    };

    // Listen for common user activity events
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize the timer immediately on mount
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null; // Invisible component, just runs the logic
}
