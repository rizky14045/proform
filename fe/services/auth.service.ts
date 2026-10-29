import apiClient from "./api";
import { ApiResponse, User } from "@/types";
import { signOut } from "next-auth/react";

export interface LoginPayload {
  username?: string;
  identifier?: string;
  email?: string;
  nid?: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponse>> => {
    const id = payload.username || payload.identifier || payload.email || payload.nid || "";
    const res: any = await apiClient.post("/auth/login", {
      identifier: id,
      username: id,
      nid: id,
      email: id,
      password: payload.password,
    });

    const token = res?.data?.token || res?.token;
    const user = res?.data?.user || res?.user;

    if (token && typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
      localStorage.setItem("token", token);
      document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
      if (user) {
        localStorage.setItem("user_info", JSON.stringify(user));
      }
    }
    return res;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user_info");
        sessionStorage.clear();

        const cookies = [
          "access_token",
          "token",
          "next-auth.session-token",
          "__Secure-next-auth.session-token",
          "next-auth.csrf-token",
          "next-auth.callback-url",
        ];

        const domains = [
          "",
          window.location.hostname,
          `.${window.location.hostname}`,
          "localhost",
          "127.0.0.1",
        ];

        cookies.forEach((c) => {
          domains.forEach((d) => {
            const domainStr = d ? `; domain=${d}` : "";
            document.cookie = `${c}=; path=/${domainStr}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            document.cookie = `${c}=; path=${domainStr}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          });
        });
      } catch (err) {
        console.error("Error clearing auth session:", err);
      }
    }
  },

  performFullLogout: async () => {
    if (typeof window === "undefined") return;
    try {
      authService.logout();
      await signOut({ redirect: false }).catch(() => {});
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      authService.logout();
      window.location.href = "/auth/login?logout=1";
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user_info");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (t && t !== "undefined" && t !== "null" && t.trim() !== "") {
        return t.trim();
      }
    }
    return null;
  },
};


