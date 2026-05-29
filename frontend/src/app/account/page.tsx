"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiGet, apiPost, apiPatch, AuthExpiredError } from "@/lib/api";
import SiteHeader from "@/components/SiteHeader";
import Toast from "@/components/Toast";
import type { AuthUser, MyBooking, CancelBookingResult } from "@/types";
import { formatDateTime, formatDuration } from "@/lib/format";

const TOPUP_OPTIONS = [100, 500, 1000];

function fetchBookings(token: string, signal?: AbortSignal) {
  return apiGet<MyBooking[]>("/api/bookings/me", {
    token,
    signal,
    authRequired: true,
  });
}

export default function AccountPage() {
  const router = useRouter();
  const { user, token, isReady, logout, updateBalance } = useAuth();
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topUpBusy, setTopUpBusy] = useState<number | null>(null);
  const [cancelBusy, setCancelBusy] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/");
    }
  }, [isReady, user, router]);

  useEffect(() => {
    if (!token) return;
    const ac = new AbortController();
    fetchBookings(token, ac.signal)
      .then((list) => {
        if (ac.signal.aborted) return;
        setBookings(list);
        setError(null);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (ac.signal.aborted) return;
        if (e instanceof AuthExpiredError) {
          logout();
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load bookings");
        setLoading(false);
      });
    return () => ac.abort();
  }, [token, logout]);

  const refreshBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await fetchBookings(token);
      setBookings(list);
      setError(null);
    } catch (e) {
      if (e instanceof AuthExpiredError) {
        logout();
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const handleTopUp = async (amount: number) => {
    if (!token) return;
    setTopUpBusy(amount);
    setError(null);
    try {
      const fresh = await apiPost<AuthUser>(
        "/api/users/me/top-up",
        { amount },
        { token, authRequired: true },
      );
      updateBalance(fresh.balance);
      setToast(`Added $${amount.toFixed(2)} to your balance.`);
    } catch (e) {
      if (e instanceof AuthExpiredError) {
        logout();
        return;
      }
      setError(e instanceof Error ? e.message : "Top-up failed");
    } finally {
      setTopUpBusy(null);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!token) return;
    if (
      !window.confirm(
        "Cancel this ticket? The amount paid will be refunded to your balance.",
      )
    ) {
      return;
    }
    setCancelBusy(bookingId);
    setError(null);
    try {
      const result = await apiPatch<CancelBookingResult>(
        `/api/bookings/${bookingId}/cancel`,
        {},
        { token, authRequired: true },
      );
      updateBalance(result.balance);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: result.status } : b,
        ),
      );
      setToast(`Ticket cancelled. $${result.refund.toFixed(2)} refunded.`);
    } catch (e) {
      if (e instanceof AuthExpiredError) {
        logout();
        return;
      }
      setError(e instanceof Error ? e.message : "Cancellation failed");
    } finally {
      setCancelBusy(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPwBusy(true);
    setPwError(null);
    try {
      await apiPost(
        "/api/auth/change-password",
        { currentPassword, newPassword },
        { token, authRequired: true },
      );
      setCurrentPassword("");
      setNewPassword("");
      setToast("Password updated.");
    } catch (err) {
      if (err instanceof AuthExpiredError) {
        logout();
        return;
      }
      setPwError(
        err instanceof Error ? err.message : "Could not change password",
      );
    } finally {
      setPwBusy(false);
    }
  };

  if (!isReady || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50 text-ink-400">
        Loading…
      </div>
    );
  }

  const totalSpent = bookings.reduce((sum, b) => sum + b.pricePaid, 0);

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-sky-800 pb-32 text-white">
        <div className="absolute inset-0 bg-noise opacity-90" />
        <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-[0.15]" />
        <div className="absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-ember-500/30 blur-[120px]" />

        <div className="relative">
          <SiteHeader variant="hero" />

          <section className="mx-auto mt-12 max-w-7xl px-6">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Account
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Hi, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-sm text-white/70">{user.email}</p>
          </section>
        </div>
      </div>

      <main className="relative z-10 mx-auto -mt-24 max-w-7xl px-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Travel balance
              </div>
              <div className="mt-2 font-display text-4xl font-bold text-ink-900">
                ${user.balance.toFixed(2)}
              </div>
              <div className="mt-1 text-sm text-ink-500">
                Use it to pay for any flight on AVIA.
              </div>

              <div className="mt-6">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Quick top-up
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {TOPUP_OPTIONS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      disabled={topUpBusy !== null}
                      onClick={() => handleTopUp(amount)}
                      className="rounded-xl border border-ink-100 bg-white px-3 py-3 text-sm font-semibold text-ink-900 transition hover:border-ember-300 hover:bg-ember-50 disabled:cursor-wait disabled:opacity-60"
                    >
                      {topUpBusy === amount ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ember-300 border-t-ember-600" />
                      ) : (
                        `+$${amount}`
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-dashed border-ink-200 pt-4">
                <div className="flex items-center justify-between text-sm text-ink-500">
                  <span>Tickets purchased</span>
                  <span className="font-semibold text-ink-900">
                    {bookings.length}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-ink-500">
                  <span>Total spent</span>
                  <span className="font-semibold text-ink-900">
                    ${totalSpent.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="mt-6 w-full rounded-xl border border-ink-100 px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                Sign out
              </button>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Change password
              </div>
              <p className="mt-1 text-sm text-ink-500">
                Enter your current password to set a new one.
              </p>
              <form onSubmit={handleChangePassword} className="mt-4 grid gap-3">
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-ink-100 px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-ember-300 focus:ring-2 focus:ring-ember-100"
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  maxLength={72}
                  placeholder="New password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-ink-100 px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-ember-300 focus:ring-2 focus:ring-ember-100"
                />
                {pwError && (
                  <p className="text-sm font-medium text-red-600">{pwError}</p>
                )}
                <button
                  type="submit"
                  disabled={pwBusy || !currentPassword || !newPassword}
                  className="w-full rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pwBusy ? "Updating…" : "Update password"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink-900 lg:text-white">
                  Your tickets
                </h2>
                <p className="mt-1 text-sm text-ink-400 lg:text-white/70">
                  Every flight you have booked, newest first.
                </p>
              </div>
              <button
                type="button"
                onClick={refreshBookings}
                className="text-xs font-semibold text-ember-600 hover:text-ember-700 lg:text-ember-300 lg:hover:text-ember-200"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="grid gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-2xl bg-white shadow-soft ring-1 ring-ink-100"
                  />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-3xl border border-ink-100 bg-white px-6 py-16 text-center shadow-soft">
                <h3 className="font-display text-lg font-semibold text-ink-900">
                  No tickets yet
                </h3>
                <p className="mt-1 text-sm text-ink-400">
                  Book your first flight to see it here.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-white shadow-ember transition hover:bg-ember-600"
                >
                  Browse flights
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {bookings.map((b) => (
                  <article
                    key={b.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-ink-100"
                  >
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                          Confirmation #{b.id}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] ${
                              b.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-ink-100 text-ink-500"
                            }`}
                          >
                            {b.status}
                          </span>
                          {b.returnFlight && (
                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] text-sky-700">
                              Round trip
                            </span>
                          )}
                          {b.passengers > 1 && (
                            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] text-ink-700">
                              {b.passengers} pax
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 font-display text-lg font-bold text-ink-900">
                          {b.flight.origin} {b.returnFlight ? "⇄" : "→"}{" "}
                          {b.flight.destination}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                          <span>
                            Depart {formatDateTime(b.flight.departureTime)}
                          </span>
                          <span>•</span>
                          <span>
                            {formatDuration(b.flight.durationMinutes)}
                          </span>
                          <span>•</span>
                          <span>Booked {formatDateTime(b.bookingTime)}</span>
                        </div>
                        {b.returnFlight && (
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                            <span>
                              Return{" "}
                              {formatDateTime(b.returnFlight.departureTime)}
                            </span>
                            <span>•</span>
                            <span>
                              {formatDuration(b.returnFlight.durationMinutes)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-ink-400">Paid</div>
                        <div className="font-display text-2xl font-bold text-ink-900">
                          ${b.pricePaid.toFixed(2)}
                        </div>
                        {b.status === "confirmed" && (
                          <button
                            type="button"
                            disabled={cancelBusy === b.id}
                            onClick={() => handleCancel(b.id)}
                            className="mt-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                          >
                            {cancelBusy === b.id
                              ? "Cancelling…"
                              : "Cancel ticket"}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <Toast
          title="Success"
          message={toast}
          duration={4000}
          onDismiss={() => setToast(null)}
        />
      )}

      {error && (
        <Toast
          variant="error"
          title="Something went wrong"
          message={error}
          duration={6000}
          onDismiss={() => setError(null)}
        />
      )}
    </div>
  );
}
