"use client";

import { useEffect, useState } from "react";
import type { Flight } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { formatShortDateTime } from "@/lib/format";

const TAX_RATE = 0.12;

interface BookingModalProps {
  flight: Flight;
  returnFlight?: Flight | null;
  passengers: number;
  onClose: () => void;
  onConfirm: (
    flightId: number,
    options: { returnFlightId?: number; passengers: number },
  ) => Promise<void>;
  isBooking: boolean;
}

export default function BookingModal({
  flight,
  returnFlight,
  passengers,
  onClose,
  onConfirm,
  isBooking,
}: BookingModalProps) {
  const { user } = useAuth();
  const [error, setError] = useState("");

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

  const fareSum = flight.price + (returnFlight ? returnFlight.price : 0);
  const subtotal = +(fareSum * passengers).toFixed(2);
  const taxes = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + taxes).toFixed(2);
  const balance = user?.balance ?? 0;
  const sufficient = balance >= total;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) {
      setError("Please sign in to book.");
      return;
    }
    if (!sufficient) {
      setError("Insufficient balance. Top up your account to continue.");
      return;
    }
    try {
      await onConfirm(flight.id, {
        returnFlightId: returnFlight?.id,
        passengers,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    }
  };

  const route = returnFlight
    ? `${flight.origin} ⇄ ${flight.destination}`
    : `${flight.origin} → ${flight.destination}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-950/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg animate-fade-up overflow-hidden rounded-t-3xl bg-white shadow-glow sm:rounded-3xl">
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
              Boarding pass · pending
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold leading-tight">
              {route}
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Outbound · {formatShortDateTime(flight.departureTime)}
            </p>
            {returnFlight && (
              <p className="mt-0.5 text-sm text-white/70">
                Return · {formatShortDateTime(returnFlight.departureTime)}
              </p>
            )}
          </div>
        </div>

        <div className="relative -mt-3 flex justify-between px-3">
          <span className="h-6 w-6 -translate-y-1/2 rounded-full bg-ink-50" />
          <div className="dashed-route mx-3 flex-1 self-center" />
          <span className="h-6 w-6 -translate-y-1/2 rounded-full bg-ink-50" />
        </div>

        <div className="px-6 pb-6 pt-2 sm:px-8">
          <div className="mb-6 rounded-2xl bg-ink-50 p-4">
            <div className="flex items-center justify-between text-sm text-ink-500">
              <span>
                Outbound fare × {passengers}
                {passengers > 1 ? " pax" : ""}
              </span>
              <span>${(flight.price * passengers).toFixed(2)}</span>
            </div>
            {returnFlight && (
              <div className="mt-1.5 flex items-center justify-between text-sm text-ink-500">
                <span>
                  Return fare × {passengers}
                  {passengers > 1 ? " pax" : ""}
                </span>
                <span>${(returnFlight.price * passengers).toFixed(2)}</span>
              </div>
            )}
            <div className="mt-1.5 flex items-center justify-between text-sm text-ink-500">
              <span>Taxes & fees</span>
              <span>${taxes.toFixed(2)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-dashed border-ink-200 pt-3">
              <span className="text-sm font-medium text-ink-700">
                Total due now
              </span>
              <span className="font-display text-2xl font-bold text-ink-900">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {user && (
            <div
              className={`mb-5 flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                sufficient
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  Your balance
                </div>
                <div className="font-display text-lg font-bold">
                  ${balance.toFixed(2)}
                </div>
              </div>
              {sufficient ? (
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Ready to pay
                </span>
              ) : (
                <a
                  href="/account"
                  className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                >
                  Top up
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl border border-ink-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                    Lead passenger
                  </div>
                  <div className="mt-1 font-semibold text-ink-900">
                    {user?.name}
                  </div>
                  <div className="text-sm text-ink-500">{user?.email}</div>
                </div>
                <div className="rounded-full bg-ink-50 px-3 py-1.5 text-xs font-semibold text-ink-700">
                  {passengers} {passengers === 1 ? "passenger" : "passengers"}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 sm:flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBooking || !sufficient}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ember-500 px-5 py-3 text-sm font-semibold text-white shadow-ember transition hover:bg-ember-600 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
              >
                {isBooking ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Confirming
                  </>
                ) : (
                  <>
                    Pay & confirm
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <p className="pt-1 text-center text-xs text-ink-400">
              Charged to your AVIA balance · Free cancellation within 24h
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
