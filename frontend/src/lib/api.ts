const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: { error: { code: string; message: string; details?: string[] } }
  ) {
    super(data.error.message);
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({
      error: { code: "unknown", message: "Something went wrong" },
    }));
    throw new ApiError(res.status, data);
  }

  return res.json();
}

// Auth API
export type User = {
  id: number;
  email: string;
  name: string;
  has_profile?: boolean;
  has_active_plan?: boolean;
};

type AuthResponse = {
  user: User;
  token: string;
};

type MeResponse = {
  user: User;
};

export const authApi = {
  signup: (data: { email: string; password: string; password_confirmation: string; name: string }) =>
    api<AuthResponse>("/api/v1/auth/signup", { method: "POST", body: { user: data } }),

  login: (data: { email: string; password: string }) =>
    api<AuthResponse>("/api/v1/auth/login", { method: "POST", body: { user: data } }),

  logout: () =>
    api<{ message: string }>("/api/v1/auth/logout", { method: "DELETE" }),

  me: () =>
    api<MeResponse>("/api/v1/auth/me"),
};
