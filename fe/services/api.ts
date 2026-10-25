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

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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

// Response Interceptor: Error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      // Do not clear on login attempt failure
      const isLoginUrl = error.config?.url?.includes("/auth/login");
      if (!isLoginUrl) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user_info");
      }
    }
    const message = error.response?.data?.message || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

