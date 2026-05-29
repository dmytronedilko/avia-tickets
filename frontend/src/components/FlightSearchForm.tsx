"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { Cabin, SearchParams, TripType } from "@/types";
import DatePicker from "./DatePicker";

interface FlightSearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const CABIN_OPTIONS: { id: Cabin; label: string }[] = [
  { id: "economy", label: "Economy" },
  { id: "premium", label: "Premium economy" },
  { id: "business", label: "Business" },
  { id: "first", label: "First" },
];

const TRIP_TYPE_OPTIONS: { id: TripType; label: string }[] = [
  { id: "round", label: "Round trip" },
  { id: "oneway", label: "One way" },
];

function FlightSearchForm({ onSearch, isLoading }: FlightSearchFormProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [tripType, setTripType] = useState<TripType>("round");
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState<Cabin>("economy");
  const [cabinOpen, setCabinOpen] = useState(false);
  const cabinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cabinOpen) return;
    const onClick = (e: MouseEvent) => {
      if (cabinRef.current && !cabinRef.current.contains(e.target as Node)) {
        setCabinOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCabinOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [cabinOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      origin,
      destination,
      date,
      returnDate: tripType === "round" ? returnDate : undefined,
      tripType,
      passengers,
      cabin,
    });
  };

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const cabinLabel =
    CABIN_OPTIONS.find((o) => o.id === cabin)?.label ?? "Economy";

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-3xl p-4 shadow-glow sm:p-6"
    >
      {/* Top row: trip type & passengers & cabin */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full bg-ink-50 p-1 text-sm">
          {TRIP_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTripType(opt.id)}
              className={`rounded-full px-4 py-1.5 font-medium transition ${
                tripType === opt.id
                  ? "bg-white text-ink-900 shadow-soft"
                  : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-ink-50 px-3 py-1.5 text-sm text-ink-700">
          <svg
            className="h-4 w-4 text-ink-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <button
            type="button"
            onClick={() => setPassengers(Math.max(1, passengers - 1))}
            className="grid h-5 w-5 place-items-center rounded-full text-ink-500 hover:bg-white hover:text-ink-900"
            aria-label="Fewer passengers"
          >
            −
          </button>
          <span className="min-w-[3.5rem] text-center font-medium">
            {passengers} pax
          </span>
          <button
            type="button"
            onClick={() => setPassengers(Math.min(9, passengers + 1))}
            className="grid h-5 w-5 place-items-center rounded-full text-ink-500 hover:bg-white hover:text-ink-900"
            aria-label="More passengers"
          >
            +
          </button>
        </div>

        <div className="relative" ref={cabinRef}>
          <button
            type="button"
            onClick={() => setCabinOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-ink-50 px-3 py-1.5 text-sm text-ink-700 transition hover:bg-ink-100"
          >
            <svg
              className="h-4 w-4 text-ink-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 11l4 4-4 4M11 7h8M11 12h8M11 17h8"
              />
            </svg>
            {cabinLabel}
            <svg
              className={`h-3 w-3 text-ink-400 transition ${
                cabinOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {cabinOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 w-48 animate-fade-up overflow-hidden rounded-2xl bg-white p-1.5 shadow-glow ring-1 ring-ink-100">
              {CABIN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setCabin(opt.id);
                    setCabinOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                    cabin === opt.id
                      ? "bg-ember-50 font-semibold text-ember-700"
                      : "text-ink-700 hover:bg-ink-50"
                  }`}
                >
                  {opt.label}
                  {cabin === opt.id && (
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fields layout: [From + swap + To] | Date | (Return?) | Search */}
      <div
        className={`grid grid-cols-1 gap-3 ${
          tripType === "round"
            ? "md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            : "md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]"
        }`}
      >
        {/* From / To pair with swap button between them */}
        <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end sm:gap-3">
          <Field
            id="origin"
            label="From"
            value={origin}
            onChange={setOrigin}
            placeholder="City or airport"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l18-9-5 18-4-8-9-1z"
              />
            }
          />

          {/* Swap — own column on desktop, centered overlay on mobile */}
          <div className="relative flex items-center justify-center sm:px-0">
            <button
              type="button"
              onClick={swap}
              aria-label="Swap origin and destination"
              className="absolute -top-4 left-1/2 z-10 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full border border-ink-100 bg-white text-ink-500 shadow-soft transition hover:rotate-180 hover:text-ember-500 sm:static sm:left-auto sm:top-auto sm:mb-[11px] sm:translate-x-0 sm:translate-y-[-2px] sm:self-end"
            >
              <svg
                className="h-4 w-4 rotate-90 sm:rotate-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </button>
          </div>

          <Field
            id="destination"
            label="To"
            value={destination}
            onChange={setDestination}
            placeholder="City or airport"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            }
          />
        </div>

        <DatePicker
          id="date"
          label="Depart"
          value={date}
          onChange={setDate}
          placeholder="Add date"
        />

        {tripType === "round" && (
          <DatePicker
            id="returnDate"
            label="Return"
            value={returnDate}
            onChange={setReturnDate}
            placeholder="Add date"
            minDate={date ? new Date(date) : undefined}
          />
        )}

        {/* Submit */}
        <div className="flex flex-col">
          <span className="mb-1 hidden text-xs font-medium uppercase tracking-wider text-transparent md:block">
            .
          </span>
          <button
            type="submit"
            disabled={isLoading}
            className="group inline-flex h-[58px] items-center justify-center gap-2 rounded-2xl bg-ember-500 px-6 font-semibold text-white shadow-ember transition hover:bg-ember-600 disabled:cursor-wait disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Searching
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default memo(FlightSearchForm);

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon: React.ReactNode;
  rounding?: string;
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  rounding = "",
}: FieldProps) {
  return (
    <div className="group flex flex-col">
      <label
        htmlFor={id}
        className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-400"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300 transition group-focus-within:text-ember-500">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            viewBox="0 0 24 24"
          >
            {icon}
          </svg>
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-transparent bg-white py-4 pl-11 pr-4 text-base font-medium text-ink-900 shadow-soft outline-none ring-1 ring-ink-100 transition placeholder:text-ink-300 focus:border-ember-300 focus:ring-2 focus:ring-ember-300 ${rounding}`}
        />
      </div>
    </div>
  );
}
