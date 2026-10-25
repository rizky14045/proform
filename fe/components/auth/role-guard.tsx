"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { authService } from "@/services/auth.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    const role =
      (session?.user as any)?.role ||
      user?.role?.code ||
      user?.user_type ||
      "ADMIN";
    setUserRole(role);
  }, [session]);

  if (status === "loading" || userRole === null) {
    return <div className="p-8 text-sm text-muted-foreground">Memeriksa hak akses modul...</div>;
  }

  const isAllowed =
    userRole === "ADMIN" ||
    allowedRoles.includes("ALL") ||
    allowedRoles.includes(userRole);

  if (!isAllowed) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 dark:border-red-900/50 shadow-md">
          <CardContent className="pt-6 pb-6 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Akses Modul Ditolak (403)</h2>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Akun Anda dengan peran <strong className="text-red-600 dark:text-red-400">{userRole}</strong> tidak memiliki otoritas untuk mengakses modul ini sesuai SOP INTERLOGS UP Sembalang.
              </p>
            </div>
            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="gap-2 text-xs">
                <Link href="/dashboard">
                  <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

