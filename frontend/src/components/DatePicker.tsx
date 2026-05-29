"use client";

import { useEffect, useRef, useState } from "react";

interface DatePickerProps {
  id?: string;
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
  placeholder?: string;
  minDate?: Date;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseIso(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function buildCells(view: Date): Date[] {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  // Monday-first offset
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = "Select date",
  minDate,
}: DatePickerProps) {
  const today = startOfDay(new Date());
  const min = minDate ? startOfDay(minDate) : today;
  const selected = parseIso(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(
    selected ?? new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const display = selected
    ? selected.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "";

  const cells = buildCells(view);
  const monthLabel = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;

  const prevMonth = () =>
    setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
  const nextMonth = () =>
    setView(new Date(view.getFullYear(), view.getMonth() + 1, 1));

  const quickPicks: { label: string; date: Date }[] = [
    { label: "Today", date: today },
    {
      label: "Tomorrow",
      date: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      ),
    },
    {
      label: "This weekend",
      date: (() => {
        const d = new Date(today);
        const day = d.getDay();
        const add = day === 0 ? 6 : 6 - day;
        d.setDate(d.getDate() + add);
        return d;
      })(),
    },
    {
      label: "+1 week",
      date: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 7,
      ),
    },
  ];

  const select = (d: Date) => {
    if (startOfDay(d) < min) return;
    onChange(toIso(d));
    setOpen(false);
  };

  return (
    <div className="relative flex flex-col" ref={wrapperRef}>
      <label
        htmlFor={id}
        className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-400"
      >
        {label}
      </label>

      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group relative flex w-full items-center gap-3 rounded-2xl border border-transparent bg-white py-4 pl-11 pr-4 text-left text-base font-medium shadow-soft outline-none ring-1 ring-ink-100 transition focus:border-ember-300 focus:ring-2 focus:ring-ember-300 ${
          open ? "border-ember-300 ring-2 ring-ember-300" : ""
        }`}
      >
        <span
          className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition ${
            open ? "text-ember-500" : "text-ink-300 group-hover:text-ink-500"
          }`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </span>
        <span
          className={`flex-1 truncate ${
            display ? "text-ink-900" : "text-ink-300"
          }`}
        >
          {display || placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-ink-400 transition ${open ? "rotate-180" : ""}`}
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

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 origin-top animate-fade-up overflow-hidden rounded-2xl bg-white shadow-glow ring-1 ring-ink-100 sm:left-auto sm:w-[340px]">
          {/* Quick picks */}
          <div className="scrollbar-none flex gap-1.5 overflow-x-auto border-b border-ink-100 bg-ink-50/60 px-3 py-2.5">
            {quickPicks.map((q) => {
              const isActive = selected && sameDay(selected, q.date);
              return (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => select(q.date)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${
                    isActive
                      ? "bg-ink-900 text-white"
                      : "bg-white text-ink-600 ring-1 ring-ink-100 hover:text-ink-900"
                  }`}
                >
                  {q.label}
                </button>
              );
            })}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-3 pt-3">
            <button
              type="button"
              onClick={prevMonth}
              className="grid h-8 w-8 place-items-center rounded-full text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
              aria-label="Previous month"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="font-display text-sm font-semibold text-ink-900">
              {monthLabel}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="grid h-8 w-8 place-items-center rounded-full text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
              aria-label="Next month"
            >
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 px-3 pt-3 text-center text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-1 px-3 pb-3">
            {cells.map((d, i) => {
              const inMonth = d.getMonth() === view.getMonth();
              const isPast = startOfDay(d) < min;
              const isToday = sameDay(d, today);
              const isSelected = selected && sameDay(d, selected);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isPast}
                  onClick={() => select(d)}
                  className={`relative h-9 rounded-lg text-sm font-medium transition ${
                    isSelected
                      ? "bg-ember-500 text-white shadow-ember"
                      : isPast
                        ? "cursor-not-allowed text-ink-200"
                        : inMonth
                          ? "text-ink-700 hover:bg-ember-50 hover:text-ember-700"
                          : "text-ink-300 hover:bg-ink-50"
                  }`}
                >
                  {d.getDate()}
                  {isToday && !isSelected && (
                    <span className="absolute inset-x-0 bottom-1 mx-auto h-1 w-1 rounded-full bg-ember-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-ink-100 px-3 py-2.5">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-xs font-medium text-ink-500 transition hover:text-ink-900"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-ink-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-ink-800"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
