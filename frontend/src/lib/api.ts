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

// Profile & Race History types
export type RunnerProfile = {
  id: number;
  experience_level: string;
  current_weekly_km: number;
  available_days: number;
  preferred_long_run_day: string;
  injury_notes: string | null;
};

export type RaceHistory = {
  id: number;
  race_name: string;
  distance_km: number;
  finish_time: string;
  finish_time_secs: number;
  race_date: string;
};

export type ProfileResponse = {
  profile: RunnerProfile;
  race_histories: RaceHistory[];
};

export type ProfileUpdatePayload = {
  profile: {
    experience_level: string;
    current_weekly_km: number;
    available_days: number;
    preferred_long_run_day: string;
    injury_notes?: string | null;
  };
};

export type RaceHistoryPayload = {
  race_history: {
    race_name: string;
    distance_km: number;
    finish_time_secs: number;
    race_date: string;
  };
};

// Backend stores preferred_long_run_day as integer 0-6 (sunday=0 ... saturday=6)
const DAY_NAME_TO_INDEX: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

export const profileApi = {
  get: () =>
    api<ProfileResponse>("/api/v1/profile"),

  update: (data: ProfileUpdatePayload) => {
    const dayIndex = DAY_NAME_TO_INDEX[data.profile.preferred_long_run_day.toLowerCase()];
    return api<ProfileResponse>("/api/v1/profile", {
      method: "PUT",
      body: {
        profile: {
          ...data.profile,
          preferred_long_run_day: dayIndex ?? data.profile.preferred_long_run_day,
        },
      },
    });
  },

  addRace: (data: RaceHistoryPayload) =>
    api<{ race_history: RaceHistory }>("/api/v1/profile/race_histories", { method: "POST", body: data }),

  deleteRace: (id: number) =>
    api<void>(`/api/v1/profile/race_histories/${id}`, { method: "DELETE" }),
};
