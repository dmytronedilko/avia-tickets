import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "AviaTickets",
  description:
    "Answers to common questions about booking, payments, changes, and your account.",
};

interface Faq {
  q: string;
  a: React.ReactNode;
}

const ICON_PROPS = {
  className: "h-5 w-5",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  viewBox: "0 0 24 24",
} as const;

const ICONS = {
  booking: (
    <svg {...ICON_PROPS}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5"
      />
    </svg>
  ),
  ticket: (
    <svg {...ICON_PROPS}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
      />
    </svg>
  ),
  refresh: (
    <svg {...ICON_PROPS}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  ),
  wallet: (
    <svg {...ICON_PROPS}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
      />
    </svg>
  ),
  shield: (
    <svg {...ICON_PROPS}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  ),
};

const TOPICS: { title: string; icon: React.ReactNode; faqs: Faq[] }[] = [
  {
    title: "Booking",
    icon: ICONS.booking,
    faqs: [
      {
        q: "How do I book a flight?",
        a: (
          <>
            Search for a route on the{" "}
            <Link href="/" className="text-ember-600 hover:text-ember-700">
              home page
            </Link>
            , pick a flight from the results, and confirm in the booking dialog.
            You will need a signed-in account and enough balance to cover the
            fare.
          </>
        ),
      },
      {
        q: "Can I book for someone else?",
        a: "Yes. Enter the traveler's name as it appears on their government-issued ID at the booking step. The booking is still tied to your account.",
      },
      {
        q: "Is my seat held while I’m on the booking screen?",
        a: "No. Inventory is only debited when you confirm. If the last seat is taken before you confirm, you will see a clear message and the booking will not go through.",
      },
    ],
  },
  {
    title: "Tickets & check-in",
    icon: ICONS.ticket,
    faqs: [
      {
        q: "Where do I find my tickets?",
        a: (
          <>
            Open{" "}
            <Link
              href="/account"
              className="text-ember-600 hover:text-ember-700"
            >
              My tickets
            </Link>{" "}
            in the header. Every confirmed booking is listed there with its
            confirmation number, route, and time.
          </>
        ),
      },
      {
        q: "How do I check in?",
        a: "Check-in is handled by the operating airline, usually 24 hours before departure. Use the airline website with your confirmation number.",
      },
      {
        q: "What if my name is misspelled?",
        a: "Minor typos can usually be fixed by the airline before departure. Contact support with your confirmation number and we will coordinate the correction.",
      },
    ],
  },
  {
    title: "Changes & cancellations",
    icon: ICONS.refresh,
    faqs: [
      {
        q: "How do I cancel a ticket?",
        a: "Open your account page, find the ticket, and click “Cancel ticket”. The booking is marked cancelled right away.",
      },
      {
        q: "How do refunds work?",
        a: "When you cancel a confirmed ticket, the full amount you paid is refunded to your travel balance instantly — there is no service fee.",
      },
      {
        q: "Can I cancel a round-trip booking?",
        a: "Yes. Cancelling a round trip releases the seats on both legs and refunds the full amount to your travel balance.",
      },
    ],
  },
  {
    title: "Payments & balance",
    icon: ICONS.wallet,
    faqs: [
      {
        q: "How does the travel balance work?",
        a: "Top up your balance from the account page, then use it to pay for any flight on AviaTickets — no card required at checkout.",
      },
      {
        q: "Which currencies are supported?",
        a: "Fares and the travel balance are displayed in US dollars. Top-ups in other currencies are converted at the rate shown at the time of top-up.",
      },
      {
        q: "Is my payment information stored?",
        a: "Card details are handled by our payment processor; we never see or store full card numbers.",
      },
    ],
  },
  {
    title: "Account & security",
    icon: ICONS.shield,
    faqs: [
      {
        q: "How do I change my password?",
        a: "Open your account page and use the “Change password” form — enter your current password and the new one. If you can’t sign in at all, contact support to recover access.",
      },
      {
        q: "How do I delete my account?",
        a: (
          <>
            Email{" "}
            <a
              href="mailto:privacy@aviatickets.example"
              className="text-ember-600 hover:text-ember-700"
            >
              privacy@aviatickets.example
            </a>{" "}
            from the address on your account. See our{" "}
            <Link
              href="/privacy"
              className="text-ember-600 hover:text-ember-700"
            >
              Privacy Policy
            </Link>{" "}
            for retention details.
          </>
        ),
      },
      {
        q: "Do you support two-factor authentication?",
        a: "TOTP-based 2FA is on the roadmap. In the meantime, use a strong, unique password.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <SiteHeader variant="solid" />

      <header className="mx-auto max-w-5xl px-6 pb-8 pt-10 sm:pt-14">
        <h1 className="font-display text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
          How can we help?
        </h1>
        <p className="mt-3 max-w-xl text-sm text-ink-500">
          Common questions about bookings, tickets, payments, and your account.
          Can&apos;t find what you need? Get in touch below.
        </p>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 pb-20">
        {TOPICS.map((topic) => (
          <section
            key={topic.title}
            className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-100 sm:p-8"
          >
            <div className="mb-5 flex items-center gap-3">
              <span
                aria-hidden
                className="grid h-10 w-10 place-items-center rounded-2xl bg-ink-900 text-white"
              >
                {topic.icon}
              </span>
              <h2 className="font-display text-xl font-bold text-ink-900">
                {topic.title}
              </h2>
            </div>
            <div className="divide-y divide-ink-100">
              {topic.faqs.map((f) => (
                <details
                  key={f.q}
                  className="group py-3 first:pt-0 last:pb-0 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-4 py-1 text-sm font-semibold text-ink-900">
                    <span>{f.q}</span>
                    <span
                      aria-hidden
                      className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-ink-50 text-ink-500 transition group-open:rotate-45 group-open:bg-ink-900 group-open:text-white"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="mt-2 text-sm leading-relaxed text-ink-600">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-ink-800 to-sky-800 p-8 text-white shadow-glow sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ember-300">
                Still stuck?
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                Talk to a human.
              </h2>
              <p className="mt-2 max-w-md text-sm text-white/70">
                Our support team is available 24/7. Reach out with your
                confirmation number and we&apos;ll get back to you within an
                hour.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:support@aviatickets.example"
                className="inline-flex items-center gap-2 rounded-full bg-ember-500 px-5 py-2.5 text-sm font-semibold text-white shadow-ember transition hover:bg-ember-600"
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
                    d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email support
              </a>
              <a
                href="tel:+18005551234"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
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
                    d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.7 2.79a2 2 0 01-.45 1.95L8 11a16 16 0 006 6l1.745-1.47a2 2 0 011.95-.45l2.79.7A2 2 0 0121 17.72V20a2 2 0 01-2 2h-1C9.716 22 2 14.284 2 5V4a1 1 0 011-1z"
                  />
                </svg>
                +1 800 555 1234
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
