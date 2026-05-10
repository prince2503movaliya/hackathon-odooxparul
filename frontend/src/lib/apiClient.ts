import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000/api";

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

// Auth errors are expected when not logged in — never show a toast for these
const AUTH_ERRORS = new Set([
  "No token provided",
  "Unauthorized",
  "Invalid token",
  "Token expired",
  "jwt malformed",
  "jwt expired",
]);

export const apiClient = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { params, ...customConfig } = options;

  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }

  const token = localStorage.getItem("traveloop_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customConfig.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  try {
    const response = await fetch(url.toString(), config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("traveloop_token");
        // Silently discard — no toast for auth errors
        throw new Error(data.message || "Unauthorized");
      }
      throw new Error(data.message || "Something went wrong");
    }

    return data.data;
  } catch (error: any) {
    console.error("API Error:", error.message);
    if (!AUTH_ERRORS.has(error.message)) {
      toast.error(error.message, { id: error.message });
    }
    throw error;
  }
};
