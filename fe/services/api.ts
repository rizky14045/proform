import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Base API URL pointing to the Go backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export function clearClientAuthSession() {
  if (typeof window === "undefined") return;
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
  } catch (e) {
    console.error("Failed to clear auth session:", e);
  }
}

// Request Interceptor: Attach JWT Token and Idempotency Key for mutating requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      let token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token && typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|;\s*)(?:access_token|token)=([^;]*)/);
        if (match) {
          token = decodeURIComponent(match[1]);
        }
      }

      // Ensure valid non-empty token string
      if (
        token &&
        token !== "undefined" &&
        token !== "null" &&
        token.trim() !== "" &&
        config.headers
      ) {
        config.headers.Authorization = `Bearer ${token.trim()}`;
      }

      // Add Idempotency key for POST / PUT / PATCH
      if (["post", "put", "patch"].includes(config.method?.toLowerCase() || "")) {
        if (!config.headers["X-Idempotency-Key"]) {
          config.headers["X-Idempotency-Key"] = crypto.randomUUID();
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRedirectingToLogin = false;

// Response Interceptor: Error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      // Do not clear on login attempt failure
      const isLoginUrl = error.config?.url?.includes("/auth/login");
      if (!isLoginUrl) {
        clearClientAuthSession();

        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/auth/login") && !isRedirectingToLogin) {
          isRedirectingToLogin = true;
          window.location.href = `/auth/login?error=session_expired&callbackUrl=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    const message = error.response?.data?.message || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;


