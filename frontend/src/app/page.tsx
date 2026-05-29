"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Flight,
  FlightSort,
  SearchParams,
  BookingResponse,
} from "@/types";
import FlightSearchForm from "@/components/FlightSearchForm";
import FlightCard from "@/components/FlightCard";
import BookingModal from "@/components/BookingModal";
import TrustStrip from "@/components/TrustStrip";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AuthModal from "@/components/AuthModal";
import Toast from "@/components/Toast";
import { useAuth } from "@/lib/auth-context";
import { apiGet, apiPost, AuthExpiredError } from "@/lib/api";

const SORT_OPTIONS: { id: FlightSort; label: string }[] = [
  { id: "best", label: "Best" },
  { id: "cheapest", label: "Cheapest" },
  { id: "fastest", label: "Fastest" },
  { id: "earliest", label: "Earliest" },
];

const DEFAULT_PARAMS: SearchParams = {
  origin: "",
  destination: "",
  date: "",
  tripType: "oneway",
  passengers: 1,
  cabin: "economy",
};

interface Selection {
  outbound: Flight;
  returnFlight?: Flight;
}

function buildQuery(
  leg: "outbound" | "return",
  params: SearchParams,
  sortBy: FlightSort,
): string {
  const q = new URLSearchParams();
  if (leg === "outbound") {
    if (params.origin) q.set("origin", params.origin);
    if (params.destination) q.set("destination", params.destination);
    if (params.date) q.set("date", params.date);
  } else {
    if (params.destination) q.set("origin", params.destination);
    if (params.origin) q.set("destination", params.origin);
    if (params.returnDate) q.set("date", params.returnDate);
  }
  if (params.cabin) q.set("cabin", params.cabin);
  if (params.passengers > 1) q.set("passengers", String(params.passengers));
  q.set("sort", sortBy);
  return q.toString();
}

async function loadFlights(
  params: SearchParams,
  sortBy: FlightSort,
  signal?: AbortSignal,
): Promise<{ outbound: Flight[]; returnFlights: Flight[] }> {
  const fetchLeg = (leg: "outbound" | "return") =>
    apiGet<Flight[]>(`/api/flights?${buildQuery(leg, params, sortBy)}`, {
      signal,
    });

  const requests: Promise<Flight[]>[] = [fetchLeg("outbound")];
  if (params.tripType === "round" && params.returnDate) {
    requests.push(fetchLeg("return"));
  }
  const [outbound, returnFlights = []] = await Promise.all(requests);
  return { outbound, returnFlights };
}

export default function Home() {
  const { user, token, updateBalance, logout } = useAuth();

  const [outbound, setOutbound] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [pendingSelection, setPendingSelection] = useState<Selection | null>(
    null,
  );
  const [authPrompt, setAuthPrompt] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [sort, setSort] = useState<FlightSort>("best");
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
  const [lastParams, setLastParams] = useState<SearchParams>(DEFAULT_PARAMS);

  const fetchFlights = useCallback(
    async (params: SearchParams, sortBy: FlightSort, fromSearch: boolean) => {
      setIsLoadingList(true);
      if (fromSearch) setIsSearching(true);
      setErrorMessage(null);
      setLastParams(params);
      try {
        const data = await loadFlights(params, sortBy);
        setOutbound(data.outbound);
        setReturnFlights(data.returnFlights);
        setSelectedOutbound(null);
      } catch {
        setErrorMessage("Unable to load flights. Please try again later.");
        setOutbound([]);
        setReturnFlights([]);
      } finally {
        setIsLoadingList(false);
        if (fromSearch) setIsSearching(false);
      }
    },
    [],
  );

  useEffect(() => {
    const ac = new AbortController();
    loadFlights(DEFAULT_PARAMS, "best", ac.signal)
      .then((data) => {
        if (ac.signal.aborted) return;
        setOutbound(data.outbound);
        setReturnFlights(data.returnFlights);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setErrorMessage("Unable to load flights. Please try again later.");
      });
    return () => ac.abort();
  }, []);

  const handleSearch = useCallback(
    (params: SearchParams) => {
      setHasSearched(true);
      fetchFlights(params, sort, true);
    },
    [fetchFlights, sort],
  );

  const handleSortChange = (next: FlightSort) => {
    if (next === sort) return;
    setSort(next);
    fetchFlights(lastParams, next, false);
  };

  const openBookingFor = (sel: Selection) => {
    if (!user) {
      setPendingSelection(sel);
      setAuthPrompt("Sign in or create an account to book this flight.");
      return;
    }
    setSelection(sel);
  };

  const handlePickOutbound = (flight: Flight) => {
    const isRound = lastParams.tripType === "round";
    if (!isRound) {
      openBookingFor({ outbound: flight });
      return;
    }
    setSelectedOutbound(flight);
  };

  const handlePickReturn = (flight: Flight) => {
    if (!selectedOutbound) return;
    openBookingFor({ outbound: selectedOutbound, returnFlight: flight });
  };

  const handleBookConfirm = async (
    flightId: number,
    options: { returnFlightId?: number; passengers: number },
  ) => {
    if (!token) {
      throw new Error("You are not signed in");
    }
    setIsBooking(true);
    try {
      const booking = await apiPost<BookingResponse>(
        "/api/bookings",
        {
          flightId,
          returnFlightId: options.returnFlightId,
          passengers: options.passengers,
        },
        { token, authRequired: true },
      );

      const updateFlightSeats = (list: Flight[]) =>
        list.map((f) => {
          if (f.id === booking.flight.id) {
            return { ...f, availableSeats: booking.flight.availableSeats };
          }
          if (booking.returnFlight && f.id === booking.returnFlight.id) {
            return {
              ...f,
              availableSeats: booking.returnFlight.availableSeats,
            };
          }
          return f;
        });
      setOutbound(updateFlightSeats);
      setReturnFlights(updateFlightSeats);

      updateBalance(booking.balance);

      setSelection(null);
      setSelectedOutbound(null);
      const route = booking.returnFlight
        ? `${booking.flight.origin} ⇄ ${booking.flight.destination}`
        : `${booking.flight.origin} → ${booking.flight.destination}`;
      setSuccessMessage(
        `Confirmation #${booking.id} for ${booking.passenger.name} — ${route}. Paid $${booking.pricePaid.toFixed(2)}, balance $${booking.balance.toFixed(2)}.`,
      );
    } catch (err) {
      if (err instanceof AuthExpiredError) {
        logout();
        throw new Error("Your session expired. Please sign in again.");
      }
      throw err;
    } finally {
      setIsBooking(false);
    }
  };

  const isRound = lastParams.tripType === "round" && !!lastParams.returnDate;
  const hasAnyFlights = outbound.length > 0 || returnFlights.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-50">
      <div className="absolute inset-x-0 top-0 h-[640px] bg-gradient-to-br from-ink-900 via-ink-800 to-sky-800">
        <div className="absolute inset-0 bg-noise opacity-90" />
        <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-[0.15]" />
        <div className="absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-ember-500/30 blur-[120px]" />
        <div className="absolute -left-20 top-40 h-[360px] w-[360px] rounded-full bg-sky-400/25 blur-[120px]" />
        <svg
          className="absolute -bottom-px left-0 block w-full text-ink-50"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M0,48 C240,96 480,0 720,32 C960,64 1200,96 1440,48 L1440,80 L0,80 Z"
          />
        </svg>
      </div>

      <div className="relative">
        <SiteHeader variant="hero" />

        <section className="relative z-10 px-6 pt-20 md:pt-28">
          <div className="mx-auto max-w-7xl text-white">
            <h1 className="max-w-3xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              The sky is closer than you think.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">
              Compare thousands of routes in seconds and lock in your seat with
              transparent pricing — no hidden fees, ever.
            </p>
          </div>
        </section>

        <section className="relative z-30 px-6 pt-10 md:pt-14">
          <div className="mx-auto max-w-7xl">
            <FlightSearchForm onSearch={handleSearch} isLoading={isSearching} />
          </div>
        </section>

        <main className="relative z-0 mx-auto max-w-7xl px-6 pb-24 pt-12">
          {(isLoadingList || hasAnyFlights) && (
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink-900">
                  {hasSearched ? "Matching flights" : "Featured departures"}
                </h2>
                <p className="mt-1 text-sm text-ink-400">
                  {isLoadingList
                    ? "Searching the network…"
                    : isRound
                      ? `${outbound.length} outbound · ${returnFlights.length} return · sorted by ${sort}`
                      : `${outbound.length} flight${outbound.length !== 1 ? "s" : ""} available · sorted by ${sort}`}
                </p>
              </div>
              <div
                role="tablist"
                aria-label="Sort flights"
                className="flex gap-2 text-xs"
              >
                {SORT_OPTIONS.map((opt) => {
                  const active = sort === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      disabled={isLoadingList}
                      onClick={() => handleSortChange(opt.id)}
                      className={`rounded-full px-4 py-2 font-medium transition disabled:cursor-wait disabled:opacity-60 ${
                        active
                          ? "bg-ink-900 text-white shadow-soft"
                          : "bg-white text-ink-500 ring-1 ring-ink-100 hover:text-ink-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isLoadingList ? (
            <div className="grid gap-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-2xl bg-white/70 shadow-soft ring-1 ring-ink-100"
                />
              ))}
            </div>
          ) : hasAnyFlights ? (
            <div className="space-y-10">
              <section>
                {isRound && (
                  <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
                    Outbound — {lastParams.origin || "Anywhere"} →{" "}
                    {lastParams.destination || "Anywhere"}
                  </h3>
                )}
                <div className="grid gap-4">
                  {outbound.map((flight, i) => (
                    <div
                      key={flight.id}
                      style={{ animationDelay: `${i * 60}ms` }}
                      className="animate-fade-up"
                    >
                      <FlightCard
                        flight={flight}
                        onBook={handlePickOutbound}
                        passengers={lastParams.passengers}
                        selected={selectedOutbound?.id === flight.id}
                        selectLabel={isRound ? "Select outbound" : "Select"}
                      />
                    </div>
                  ))}
                  {outbound.length === 0 && (
                    <EmptyResults label="No outbound flights match." />
                  )}
                </div>
              </section>

              {isRound && (
                <section>
                  <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
                    Return — {lastParams.destination || "Anywhere"} →{" "}
                    {lastParams.origin || "Anywhere"}
                  </h3>
                  {!selectedOutbound && (
                    <p className="mb-3 rounded-2xl bg-ember-50 px-4 py-2.5 text-sm text-ember-800">
                      Pick an outbound flight first to choose the return.
                    </p>
                  )}
                  <div
                    className={`grid gap-4 ${
                      !selectedOutbound ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    {returnFlights.map((flight, i) => (
                      <div
                        key={flight.id}
                        style={{ animationDelay: `${i * 60}ms` }}
                        className="animate-fade-up"
                      >
                        <FlightCard
                          flight={flight}
                          onBook={handlePickReturn}
                          passengers={lastParams.passengers}
                          selectLabel="Select return"
                        />
                      </div>
                    ))}
                    {returnFlights.length === 0 && (
                      <EmptyResults label="No return flights match." />
                    )}
                  </div>
                </section>
              )}
            </div>
          ) : (
            !errorMessage && <EmptyResults />
          )}

          {!isLoadingList && hasAnyFlights && <TrustStrip />}
        </main>

        <SiteFooter />
      </div>

      {selection && (
        <BookingModal
          flight={selection.outbound}
          returnFlight={selection.returnFlight}
          passengers={lastParams.passengers}
          onClose={() => setSelection(null)}
          onConfirm={handleBookConfirm}
          isBooking={isBooking}
        />
      )}

      {authPrompt && (
        <AuthModal
          initialMode="register"
          message={authPrompt}
          onClose={() => {
            setAuthPrompt(null);
            setPendingSelection(null);
          }}
          onSuccess={() => {
            setAuthPrompt(null);
            if (pendingSelection) {
              setSelection(pendingSelection);
              setPendingSelection(null);
            }
          }}
        />
      )}

      {successMessage && (
        <Toast
          title="Booking confirmed"
          message={successMessage}
          duration={8000}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {errorMessage && (
        <Toast
          variant="error"
          title="Something went wrong"
          message={errorMessage}
          duration={6000}
          onDismiss={() => setErrorMessage(null)}
        />
      )}
    </div>
  );
}

function EmptyResults({
  label = "No flights match your search",
}: {
  label?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-ink-200 bg-white/60 px-6 py-20 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-ink-50 text-ink-300">
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">
        {label}
      </h3>
      <p className="mt-1 text-sm text-ink-400">
        Try a different city, date, or remove a filter.
      </p>
    </div>
  );
}
