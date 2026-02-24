"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useSessionValidation() {
  const router = useRouter();

  useEffect(() => {
    // Check session every 30 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          // Session invalid, redirect to signin
          router.push("/signin");
        }
      } catch (error) {
        console.error("Session validation error:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [router]);
}
