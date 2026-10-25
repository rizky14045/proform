import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { authOptions } from "@/lib/auth";
import { getServerSession, NextAuthOptions } from "next-auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/app/dictionaries";
import React, { Suspense } from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions as NextAuthOptions);

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const trans = await getDictionary("en");

  return (
    <Suspense>
      <DashBoardLayoutProvider trans={trans}>{children}</DashBoardLayoutProvider>
    </Suspense>
  );
};

export default layout;
