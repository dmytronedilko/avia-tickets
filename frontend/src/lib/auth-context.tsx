"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { AuthResult, AuthUser } from "@/types";
import { apiGet, apiPost, AuthExpiredError } from "@/lib/api";

const TOKEN_KEY = "avia.token";
const USER_KEY = "avia.user";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  updateBalance: (balance: number) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthSnapshot {
  token: string | null;
  user: AuthUser | null;
}

const EMPTY_AUTH: AuthSnapshot = { token: null, user: null };

const listeners = new Set<() => void>();

function subscribeAuth(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === TOKEN_KEY || e.key === USER_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function emitAuthChange() {
  for (const l of listeners) l();
}

// Cached so useSyncExternalStore gets a stable reference between reads.
let cacheKey: string | null = null;
let cacheValue: AuthSnapshot = EMPTY_AUTH;

function readClientAuth(): AuthSnapshot {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    if (!t || !u) {
      if (cacheKey !== null) {
        cacheKey = null;
        cacheValue = EMPTY_AUTH;
      }
      return cacheValue;
    }
    const key = `${t}|${u}`;
    if (key === cacheKey) return cacheValue;
    cacheKey = key;
    cacheValue = { token: t, user: JSON.parse(u) as AuthUser };
    return cacheValue;
  } catch {
    cacheKey = null;
    cacheValue = EMPTY_AUTH;
    return EMPTY_AUTH;
  }
}

function readServerAuth(): AuthSnapshot {
  return EMPTY_AUTH;
}

function writeAuth(token: string | null, user: AuthUser | null) {
  if (token && user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  emitAuthChange();
}

// Flips to true on the first client commit. Lets consumers distinguish
// "still hydrating" from "definitely logged out".
const noopSubscribe = () => () => {};
const trueSnapshot = () => true;
const falseSnapshot = () => false;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useSyncExternalStore(
    subscribeAuth,
    readClientAuth,
    readServerAuth,
  );
  const isReady = useSyncExternalStore(
    noopSubscribe,
    trueSnapshot,
    falseSnapshot,
  );

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiPost<AuthResult>("/api/auth/login", {
      email,
      password,
    });
    writeAuth(result.token, result.user);
  }, []);

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const result = await apiPost<AuthResult>("/api/auth/register", {
        email,
        name,
        password,
      });
      writeAuth(result.token, result.user);
    },
    [],
  );

  const logout = useCallback(() => {
    writeAuth(null, null);
  }, []);

  const refresh = useCallback(async () => {
    if (!auth.token) return;
    try {
      const fresh = await apiGet<AuthUser>("/api/auth/me", {
        token: auth.token,
        authRequired: true,
      });
      writeAuth(auth.token, fresh);
    } catch (err) {
      if (err instanceof AuthExpiredError) writeAuth(null, null);
    }
  }, [auth.token]);

  const updateBalance = useCallback(
    (balance: number) => {
      if (!auth.token || !auth.user) return;
      writeAuth(auth.token, { ...auth.user, balance });
    },
    [auth.token, auth.user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth.user,
      token: auth.token,
      isReady,
      login,
      register,
      logout,
      refresh,
      updateBalance,
    }),
    [
      auth.user,
      auth.token,
      isReady,
      login,
      register,
      logout,
      refresh,
      updateBalance,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
