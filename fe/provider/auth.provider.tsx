"use client";

import React, { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";

function AuthTokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      const userObj = session.user as any;
      const token = userObj.token;
      if (token && typeof window !== "undefined") {
        const currentToken = localStorage.getItem("access_token");
        if (!currentToken || currentToken !== token) {
          localStorage.setItem("access_token", token);
          localStorage.setItem("token", token);
          document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
        }
        if (userObj.userData && !localStorage.getItem("user_info")) {
          localStorage.setItem("user_info", JSON.stringify(userObj.userData));
        }
      }
    }
  }, [session]);

  return null;
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider basePath="/api/auth">
      <AuthTokenSync />
      {children}
    </SessionProvider>
  );
};

export default AuthProvider;
