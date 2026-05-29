import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "AviaTickets",
  description: "What cookies AviaTickets uses and how you can control them.",
};

const CATEGORIES = [
  {
    name: "Strictly necessary",
    required: true,
    summary:
      "Keep you signed in, remember your search session, and protect bookings from CSRF attacks.",
    examples: ["session token", "csrf token", "auth state"],
  },
  {
    name: "Functional",
    required: false,
    summary:
      "Remember your preferences such as currency, language, recent searches, and sort order.",
    examples: ["preferred currency", "last search", "sort preference"],
  },
  {
    name: "Analytics",
    required: false,
    summary:
      "Help us understand which pages and flows perform well so we can improve them. Data is aggregated and de-identified.",
    examples: ["page view counts", "anonymous user id"],
  },
  {
    name: "Marketing",
    required: false,
    summary:
      "Used to measure the performance of campaigns and to show relevant offers. Off by default.",
    examples: ["campaign attribution", "ad measurement"],
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <SiteHeader variant="solid" />

      <header className="mx-auto max-w-4xl px-6 pb-8 pt-10 sm:pt-14">
        <h1 className="font-display text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
          Cookie Policy
        </h1>
        <p className="mt-3 text-sm text-ink-500">Last updated: May 24, 2026</p>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 pb-20">
        <article className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-100 sm:p-10">
          <h2 className="font-display text-xl font-bold text-ink-900">
            What is a cookie?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            A cookie is a small text file stored on your device by your browser
            when you visit a website. Cookies let a site remember things about
            you — such as that you are signed in, or which currency you prefer —
            across pages and visits.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            We also use similar technologies (local storage, session storage)
            for the same purposes. In this policy &ldquo;cookies&rdquo; refers
            to all of them.
          </p>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-100 sm:p-10">
          <h2 className="font-display text-xl font-bold text-ink-900">
            Categories we use
          </h2>
          <div className="mt-6 divide-y divide-ink-100">
            {CATEGORIES.map((c) => (
              <div
                key={c.name}
                className="grid gap-2 py-5 first:pt-0 last:pb-0 sm:grid-cols-[180px_1fr] sm:gap-6"
              >
                <div>
                  <h3 className="font-display text-base font-bold text-ink-900">
                    {c.name}
                  </h3>
                  <p
                    className={`mt-1 text-xs font-medium ${
                      c.required ? "text-ink-500" : "text-ember-600"
                    }`}
                  >
                    {c.required ? "Always on" : "Optional"}
                  </p>
                </div>
                <div>
                  <p className="text-sm leading-relaxed text-ink-600">
                    {c.summary}
                  </p>
                  <p className="mt-2 text-xs text-ink-500">
                    <span className="text-ink-400">Examples: </span>
                    <span>{c.examples.join(", ")}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-100 sm:p-10">
          <h2 className="font-display text-xl font-bold text-ink-900">
            Managing cookies
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            You can control optional cookies at any time through your browser
            settings or by clearing site data. Disabling strictly necessary
            cookies will prevent you from signing in or completing a booking.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-600">
            <li>
              Chrome:{" "}
              <span className="text-ink-500">
                Settings → Privacy and security → Cookies
              </span>
            </li>
            <li>
              Safari:{" "}
              <span className="text-ink-500">
                Settings → Privacy → Manage Website Data
              </span>
            </li>
            <li>
              Firefox:{" "}
              <span className="text-ink-500">
                Settings → Privacy &amp; Security → Cookies and Site Data
              </span>
            </li>
          </ul>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-100 sm:p-10">
          <h2 className="font-display text-xl font-bold text-ink-900">
            More on data handling
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            For details on how we handle the information collected through
            cookies, see our{" "}
            <Link
              href="/privacy"
              className="text-ember-600 underline hover:text-ember-700"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
