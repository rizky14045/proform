import apiClient from "./api";
import { ApiResponse, User } from "@/types";

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
      cookies.forEach((c) => {
        document.cookie = `${c}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${c}=; path=/; domain=${window.location.hostname}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
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
      return localStorage.getItem("access_token") || localStorage.getItem("token");
    }
    return null;
  },
};

