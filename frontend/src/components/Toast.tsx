"use client";

import { useEffect } from "react";

type ToastVariant = "success" | "error";

interface ToastProps {
  title?: string;
  message: string;
  onDismiss: () => void;
  duration?: number;
  variant?: ToastVariant;
}

const VARIANTS: Record<
  ToastVariant,
  { border: string; ring: string; iconBg: string; icon: React.ReactNode }
> = {
  success: {
    border: "border-emerald-200/70",
    ring: "ring-emerald-100",
    iconBg: "bg-emerald-500",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    ),
  },
  error: {
    border: "border-red-200/70",
    ring: "ring-red-100",
    iconBg: "bg-red-500",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    ),
  },
};

export default function Toast({
  title,
  message,
  onDismiss,
  duration = 5000,
  variant = "success",
}: ToastProps) {
  useEffect(() => {
    if (duration <= 0) return;
    const id = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(id);
  }, [duration, onDismiss]);

  const v = VARIANTS[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className="pointer-events-none fixed inset-x-4 bottom-6 z-[60] flex justify-center sm:inset-x-auto sm:bottom-6 sm:right-6 sm:justify-end"
    >
      <div
        className={`pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 shadow-glow ring-1 ${v.border} ${v.ring}`}
      >
        <span
          className={`mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-white ${v.iconBg}`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={variant === "error" ? 2 : 3}
            viewBox="0 0 24 24"
          >
            {v.icon}
          </svg>
        </span>
        <div className="flex-1 pt-0.5">
          {title && (
            <div className="text-sm font-semibold text-ink-900">{title}</div>
          )}
          <div className="text-sm text-ink-600">{message}</div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-ink-300 transition hover:text-ink-700"
          aria-label="Dismiss"
        >
          <svg
            className="h-5 w-5"
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
      </div>
    </div>
  );
}
