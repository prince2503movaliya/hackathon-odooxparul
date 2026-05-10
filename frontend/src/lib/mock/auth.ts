// Mock auth service backed by localStorage
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "USER" | "ADMIN";
  language: string;
  preferences: {
    currency: string;
    notifications: boolean;
    publicProfile: boolean;
  };
};

const KEY = "traveloop:user:v1";
const isClient = () => typeof window !== "undefined";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function read(): User | null {
  if (!isClient()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch { return null; }
}
function write(u: User | null) {
  if (!isClient()) return;
  if (u) window.localStorage.setItem(KEY, JSON.stringify(u));
  else window.localStorage.removeItem(KEY);
}

import { apiClient } from "@/lib/apiClient";

export const authService = {
  current(): User | null { return read(); },
  
  async signIn(email: string, password: string): Promise<User> {
    const data = await apiClient<{ user: any; accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    
    const user: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.profilePhoto,
      role: data.user.role || "USER",
      language: data.user.languagePreference || "English",
      preferences: { currency: "INR", notifications: true, publicProfile: false },
    };
    
    localStorage.setItem("traveloop_token", data.accessToken);
    write(user);
    return user;
  },

  async signUp(name: string, email: string, password: string): Promise<User> {
    const userResponse = await apiClient<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    
    // After signup, we log them in
    return this.signIn(email, password);
  },

  async forgot(email: string): Promise<void> {
    await apiClient("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async update(patch: Partial<User>): Promise<User | null> {
    const data = await apiClient<any>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({
        name: patch.name,
        languagePreference: patch.language,
      }),
    });
    
    const u = read();
    if (!u) return null;
    const next = { ...u, ...patch, name: data.name, language: data.languagePreference };
    write(next);
    return next;
  },

  signOut() {
    localStorage.removeItem("traveloop_token");
    write(null);
  },
};

export type Theme = "light" | "dark";
const THEME_KEY = "traveloop:theme";
export const themeService = {
  get(): Theme {
    if (!isClient()) return "light";
    return (window.localStorage.getItem(THEME_KEY) as Theme) || "light";
  },
  set(t: Theme) {
    if (!isClient()) return;
    window.localStorage.setItem(THEME_KEY, t);
    document.documentElement.classList.toggle("dark", t === "dark");
  },
  apply() {
    if (!isClient()) return;
    const t = this.get();
    document.documentElement.classList.toggle("dark", t === "dark");
  },
};
