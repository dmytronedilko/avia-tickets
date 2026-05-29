"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

type Mode = "login" | "register";

interface AuthModalProps {
  initialMode?: Mode;
  onClose: () => void;
  onSuccess?: () => void;
  message?: string;
}

export default function AuthModal({
  initialMode = "login",
  onClose,
  onSuccess,
  message,
}: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (mode === "register" && name.trim().length < 2) {
      setError("Please enter your full name");
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        await login(trimmedEmail, password);
      } else {
        await register(trimmedEmail, name.trim(), password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-950/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md animate-fade-up overflow-hidden rounded-t-3xl bg-white shadow-glow sm:rounded-3xl">
        <div className="relative overflow-hidden bg-gradient-to-br from-ink-900 to-sky-800 px-6 pb-8 pt-6 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ember-500/40 blur-3xl" />
          <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-10" />

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="relative">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
              {isLogin ? "Welcome back" : "Create your account"}
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold leading-tight">
              {isLogin ? "Sign in to AVIA" : "Join AVIA in seconds"}
            </h2>
            <p className="mt-1 text-sm text-white/70">
              {isLogin
                ? "Access your balance and booked flights."
                : "Get $1,000 in travel credit on us."}
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-6 sm:px-8">
          {message && (
            <div className="mb-4 rounded-xl border border-ember-200 bg-ember-50 px-3 py-2.5 text-sm text-ember-900">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Field
                id="auth-name"
                label="Full name"
                placeholder="As shown on your ID"
                value={name}
                onChange={setName}
                autoComplete="name"
              />
            )}
            <Field
              id="auth-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <Field
              id="auth-password"
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={setPassword}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ember-500 px-5 py-3 text-sm font-semibold text-white shadow-ember transition hover:bg-ember-600 disabled:cursor-wait disabled:opacity-70"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {isLogin ? "Signing in" : "Creating account"}
                </>
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-ink-500">
            {isLogin ? (
              <>
                New to AVIA?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode("register");
                  }}
                  className="font-semibold text-ember-600 hover:text-ember-700"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode("login");
                  }}
                  className="font-semibold text-ember-600 hover:text-ember-700"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-ink-500"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm font-medium text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-ember-300 focus:ring-2 focus:ring-ember-200"
      />
    </div>
  );
}
