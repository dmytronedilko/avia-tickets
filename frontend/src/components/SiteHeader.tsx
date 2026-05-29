"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "./AuthModal";

interface SiteHeaderProps {
  variant?: "hero" | "solid";
}

export default function SiteHeader({ variant = "hero" }: SiteHeaderProps) {
  const { user, logout, isReady } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);

  const onHero = variant === "hero";
  const linkColor = onHero ? "text-white/80" : "text-ink-500";
  const linkHover = onHero ? "hover:text-white" : "hover:text-ink-900";
  const signInColor = onHero ? "text-white/80" : "text-ink-700";
  const signInHover = onHero
    ? "hover:bg-white/10 hover:text-white"
    : "hover:bg-ink-50 hover:text-ink-900";

  return (
    <>
      <header className="relative z-20 px-6 pt-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/"
            className={`group flex items-center gap-2.5 ${
              onHero ? "text-white" : "text-ink-900"
            }`}
            aria-label="AviaTickets — home"
          >
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white text-ink-900 shadow-soft">
              <span className="font-display text-xl font-bold leading-none">
                A
              </span>
              <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-ember-500" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              AVIA<span className="text-ember-400">.</span>TICKETS
            </span>
          </Link>

          <nav
            className={`hidden items-center gap-8 text-sm md:flex ${linkColor}`}
          >
            <Link href="/" className={`transition ${linkHover}`}>
              Flights
            </Link>
            {user && (
              <Link href="/account" className={`transition ${linkHover}`}>
                My tickets
              </Link>
            )}
            <Link href="/help" className={`transition ${linkHover}`}>
              Help
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isReady && user ? (
              <>
                <Link
                  href="/account"
                  className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-semibold transition sm:gap-2.5 sm:pr-4 ${
                    onHero
                      ? "bg-white text-ink-900 shadow-soft hover:bg-ember-50"
                      : "bg-ink-900 text-white hover:bg-ink-800"
                  }`}
                  title={`Balance: $${user.balance.toFixed(2)}`}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ember-500 text-[11px] font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">
                    {user.name.split(" ")[0]}
                  </span>
                  <span
                    aria-hidden
                    className={`hidden h-4 w-px sm:block ${
                      onHero ? "bg-ink-200" : "bg-white/20"
                    }`}
                  />
                  <span
                    className={`tabular-nums ${
                      onHero ? "text-ink-500" : "text-white/70"
                    }`}
                  >
                    ${user.balance.toFixed(2)}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className={`hidden rounded-full px-3 py-2 text-sm transition sm:inline-flex ${signInColor} ${signInHover}`}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`hidden rounded-full px-4 py-2 text-sm transition sm:inline-flex ${signInColor} ${signInHover}`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-900 shadow-soft transition hover:bg-ember-100"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {authMode && (
        <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />
      )}
    </>
  );
}
