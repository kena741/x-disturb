import { SessionData } from "@/types/session";

// Custom session storage wrapper
export const session = {
  getItem: <K extends keyof SessionData>(key: K): SessionData[K] | null => {
    if (typeof window === "undefined") return null;
    const value = sessionStorage.getItem(key as string);
    if (value === null) return null;

    // Handle type conversion based on your needs
    try {
      return JSON.parse(value) as SessionData[K];
    } catch {
      return value as SessionData[K];
    }
  },

  setItem: <K extends keyof SessionData>(key: K, value: SessionData[K]) => {
    if (typeof window === "undefined") return;
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    sessionStorage.setItem(key as string, stringValue);
  },
  
  removeItem: <K extends keyof SessionData>(key: K) => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(key as string);
  },

  clear: () => {
    if (typeof window === "undefined") return;
    sessionStorage.clear();
  },
};
