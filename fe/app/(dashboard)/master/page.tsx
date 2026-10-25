"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function MasterIndexRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    let userRole = (session?.user as any)?.role;
    if (!userRole && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user_info");
        if (stored) {
          userRole = JSON.parse(stored)?.role;
        }
      } catch (e) {}
    }

    const role = (userRole || "ADMIN").toUpperCase();

    if (role === "ADMIN" || role === "SUPERADMIN") {
      router.replace("/master/users");
    } else if (role === "SPV_PENGADAAN" || role === "STAFF_PENGADAAN") {
      router.replace("/master/suppliers");
    } else if (
      role === "SPV_INVENTORY" ||
      role === "STAFF_INVENTORY" ||
      role === "SPV_GUDANG" ||
      role === "STAFF_GUDANG"
    ) {
      router.replace("/master/stock-codes");
    } else {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <p className="text-sm text-muted-foreground animate-pulse">
        Mengarahkan ke modul Master Data yang sesuai...
      </p>
    </div>
  );
}
