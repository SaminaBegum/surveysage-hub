import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role, User } from "./types";
import { useStore } from "./store";

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string; role?: Role };
  signup: (data: { name: string; email: string; password: string; role: Role; company?: string }) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
}

const KEY = "surveysathi_session_v3";
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { db, setDB, uid } = useStore();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) {
        const id = JSON.parse(raw);
        const found = db.users.find((u) => u.id === id);
        if (found) setUser(found);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.users.length]);

  const persist = (u: User | null) => {
    setUser(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem(KEY, JSON.stringify(u.id));
      else localStorage.removeItem(KEY);
    }
  };

  const login: AuthState["login"] = (email, password) => {
    const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) return { ok: false, error: "Invalid email or password" };
    persist(u);
    return { ok: true, role: u.role };
  };

  const signup: AuthState["signup"] = ({ name, email, password, role, company }) => {
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "Email already registered" };
    }
    const newUser: User = { id: uid("u"), name, email, password, role, company };
    setDB((d) => ({ ...d, users: [...d.users, newUser] }));
    persist(newUser);
    return { ok: true };
  };

  const logout = () => persist(null);

  const updateProfile: AuthState["updateProfile"] = (patch) => {
    if (!user) return;
    const updated = { ...user, ...patch };
    setDB((d) => ({ ...d, users: d.users.map((u) => (u.id === user.id ? updated : u)) }));
    persist(updated);
  };

  return <Ctx.Provider value={{ user, login, signup, logout, updateProfile }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
