"use client";

import type { Cabin, Flight } from "@/types";
import {
  addMinutesIso,
  formatDate,
  formatDuration,
  formatTime,
} from "@/lib/format";

interface FlightCardProps {
  flight: Flight;
  onBook: (flight: Flight) => void;
  selected?: boolean;
  selectLabel?: string;
  passengers?: number;
}

const CABIN_LABEL: Record<Cabin, string> = {
  economy: "Economy",
  premium: "Premium economy",
  business: "Business",
  first: "First",
};

const AIRPORT_CODES: Record<string, string> = {
  "New York": "JFK",
  London: "LHR",
  Paris: "CDG",
  Tokyo: "HND",
  Dubai: "DXB",
  Berlin: "BER",
  Madrid: "MAD",
  Rome: "FCO",
  Amsterdam: "AMS",
  Singapore: "SIN",
  Istanbul: "IST",
  Barcelona: "BCN",
  Vienna: "VIE",
  Prague: "PRG",
  Lisbon: "LIS",
  Warsaw: "WAW",
  Kyiv: "KBP",
  Moscow: "SVO",
};

function airportCode(city: string): string {
  return (
    AIRPORT_CODES[city] ||
    city
      .replace(/[^A-Za-zА-Яа-я ]/g, "")
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3)
      .padEnd(3, "X")
  );
}

export default function FlightCard({
  flight,
  onBook,
  selected = false,
  selectLabel = "Select",
  passengers = 1,
}: FlightCardProps) {
  const isSoldOut = flight.availableSeats < passengers;
  const lowSeats =
    !isSoldOut &&
    flight.availableSeats - passengers >= 0 &&
    flight.availableSeats <= 5;
  const arrival = addMinutesIso(flight.departureTime, flight.durationMinutes);
  const durationLabel = formatDuration(flight.durationMinutes);
  const originCode = airportCode(flight.origin);
  const destCode = airportCode(flight.destination);

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl bg-white shadow-soft ring-1 transition hover:-translate-y-0.5 hover:shadow-glow ${
        selected ? "ring-2 ring-ember-400" : "ring-ink-100"
      } ${isSoldOut ? "opacity-70" : ""}`}
    >
      {/* Accent rail */}
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-ember-400 to-sky-500 opacity-0 transition group-hover:opacity-100" />

      <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:p-6">
        {/* Route */}
        <div>
          {/* Airline & tags */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-full bg-ink-50 px-3 py-1 font-medium text-ink-700">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-ink-900 text-[10px] font-bold text-white">
                AV
              </span>
              AviaJet · AV{1000 + flight.id}
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
              Direct
            </span>
            {flight.cabin !== "economy" && (
              <span className="rounded-full bg-sky-50 px-2.5 py-1 font-medium text-sky-700">
                {CABIN_LABEL[flight.cabin]}
              </span>
            )}
            {lowSeats && (
              <span className="rounded-full bg-ember-50 px-2.5 py-1 font-medium text-ember-600">
                Only {flight.availableSeats} left
              </span>
            )}
            {isSoldOut && (
              <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-600">
                Sold out
              </span>
            )}
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Origin */}
            <div className="min-w-0">
              <div className="font-display text-2xl font-bold leading-none text-ink-900 sm:text-3xl">
                {formatTime(flight.departureTime)}
              </div>
              <div className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">
                {originCode}
              </div>
              <div className="mt-0.5 truncate text-xs text-ink-500">
                {flight.origin}
              </div>
            </div>

            {/* Path */}
            <div className="flex flex-1 flex-col items-center px-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-300">
                {durationLabel}
              </div>
              <div className="my-1 flex w-full items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                <div className="dashed-route h-px flex-1" />
                <span className="text-ink-300">
                  <svg
                    className="h-4 w-4 rotate-90"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21 16v-2l-8-5V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                  </svg>
                </span>
                <div className="dashed-route h-px flex-1" />
                <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">
                Nonstop
              </div>
            </div>

            {/* Destination */}
            <div className="min-w-0 text-right">
              <div className="font-display text-2xl font-bold leading-none text-ink-900 sm:text-3xl">
                {formatTime(arrival)}
              </div>
              <div className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">
                {destCode}
              </div>
              <div className="mt-0.5 truncate text-xs text-ink-500">
                {flight.destination}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(flight.departureTime)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Carry-on included
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Free seat selection
            </span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between gap-4 border-t border-dashed border-ink-100 pt-4 md:flex-col md:items-end md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <div className="md:text-right">
            <div className="text-xs text-ink-400">from</div>
            <div className="font-display text-3xl font-bold leading-none text-ink-900">
              <span className="text-base font-semibold text-ink-400">$</span>
              {flight.price.toFixed(0)}
            </div>
            <div className="mt-1 text-xs text-ink-400">per passenger</div>
          </div>

          <button
            onClick={() => onBook(flight)}
            disabled={isSoldOut}
            className={`group/btn inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSoldOut
                ? "cursor-not-allowed bg-ink-100 text-ink-300"
                : selected
                  ? "bg-ember-500 text-white shadow-ember focus:ring-ember-400"
                  : "bg-ink-900 text-white shadow-soft hover:bg-ember-500 hover:shadow-ember focus:ring-ember-400"
            }`}
          >
            {isSoldOut ? "Unavailable" : selected ? "Selected" : selectLabel}
            {!isSoldOut && !selected && (
              <svg
                className="h-4 w-4 transition group-hover/btn:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            )}
            {selected && (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
