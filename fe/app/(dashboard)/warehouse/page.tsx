"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function WarehouseIndexRedirect() {
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

    if (["ADMIN", "SUPERADMIN", "SPV_GUDANG", "STAFF_GUDANG", "MGR_LOGISTIK"].includes(role)) {
      router.replace("/warehouse/receipts");
    } else if (["MGR_USER", "SPV_USER", "STAFF_USER"].includes(role)) {
      router.replace("/warehouse/acts");
    } else {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <p className="text-sm text-muted-foreground animate-pulse">
        Mengarahkan ke modul Logistik Gudang...
      </p>
    </div>
  );
}
