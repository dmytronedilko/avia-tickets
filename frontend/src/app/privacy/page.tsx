import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "AviaTickets",
  description:
    "How AviaTickets collects, uses, and protects your personal information.",
};

const SECTIONS = [
  {
    title: "1. What we collect",
    body: (
      <>
        <p>
          We collect the information you provide directly and a limited set of
          technical data needed to run the Service.
        </p>
        <ul>
          <li>
            <strong>Account data:</strong> name, email, password hash, travel
            balance.
          </li>
          <li>
            <strong>Booking data:</strong> passenger names, flight selections,
            confirmation history.
          </li>
          <li>
            <strong>Technical data:</strong> IP address, user agent, request
            logs, and cookies (see our{" "}
            <Link
              href="/cookies"
              className="text-ember-600 hover:text-ember-700"
            >
              Cookie Policy
            </Link>
            ).
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "2. How we use your data",
    body: (
      <>
        <p>We use your information to:</p>
        <ul>
          <li>Search, price, and confirm flight bookings.</li>
          <li>Authenticate you and protect your account.</li>
          <li>Send booking confirmations and operational notifications.</li>
          <li>Detect fraud and abuse, and meet legal obligations.</li>
          <li>
            Improve the Service through aggregated, non-identifying usage
            analysis.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Legal bases",
    body: (
      <p>
        We process your data on the basis of contract performance (delivering
        the booking you requested), legitimate interest (security, fraud
        prevention, product improvement), legal obligation (tax and aviation
        records), and consent where required (for non-essential cookies).
      </p>
    ),
  },
  {
    title: "4. Sharing",
    body: (
      <>
        <p>
          We share data only as needed to provide the Service or where legally
          required:
        </p>
        <ul>
          <li>
            <strong>Airlines and travel partners</strong> — to issue and service
            your tickets.
          </li>
          <li>
            <strong>Payment processors</strong> — to charge and refund travel
            balance top-ups.
          </li>
          <li>
            <strong>Infrastructure providers</strong> — for hosting, logging,
            and backup. They are bound by confidentiality.
          </li>
          <li>
            <strong>Authorities</strong> — when compelled by valid legal
            process.
          </li>
        </ul>
        <p>We do not sell personal data.</p>
      </>
    ),
  },
  {
    title: "5. Retention",
    body: (
      <p>
        Account and booking records are retained for as long as your account is
        active and for up to 7 years afterward, to satisfy tax and aviation
        recordkeeping rules. Server logs are kept for 30 days.
      </p>
    ),
  },
  {
    title: "6. Your rights",
    body: (
      <>
        <p>
          Depending on your jurisdiction (GDPR, CCPA, and similar), you have the
          right to:
        </p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Correct inaccurate data.</li>
          <li>
            Delete your account and associated data, subject to legal retention.
          </li>
          <li>Export your data in a portable format.</li>
          <li>Object to or restrict certain processing.</li>
        </ul>
        <p>
          To exercise these rights, email{" "}
          <a
            href="mailto:privacy@aviatickets.example"
            className="text-ember-600 hover:text-ember-700"
          >
            privacy@aviatickets.example
          </a>
          . We respond within 30 days.
        </p>
      </>
    ),
  },
  {
    title: "7. Security",
    body: (
      <p>
        Passwords are stored as salted hashes; transport uses TLS; access to
        production data is limited and audited. No system is perfectly secure —
        please use a strong, unique password and notify us if you suspect misuse
        of your account.
      </p>
    ),
  },
  {
    title: "8. International transfers",
    body: (
      <p>
        We may process data outside your country of residence. Where required,
        we rely on standard contractual clauses or equivalent safeguards to
        protect transferred data.
      </p>
    ),
  },
  {
    title: "9. Children",
    body: (
      <p>
        The Service is not intended for children under 16. We do not knowingly
        collect data from children. If you believe we have, please contact us
        and we will delete it.
      </p>
    ),
  },
  {
    title: "10. Changes",
    body: (
      <p>
        Material changes to this Policy will be posted here with an updated
        date. For significant changes we will additionally notify you by email.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <SiteHeader variant="solid" />

      <header className="mx-auto max-w-4xl px-6 pb-8 pt-10 sm:pt-14">
        <h1 className="font-display text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-ink-500">Last updated: May 24, 2026</p>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-20">
        <article className="space-y-8 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-100 sm:p-10">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-xl font-bold text-ink-900">
                {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-600 [&_a]:underline [&_li]:leading-relaxed [&_strong]:text-ink-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
                {s.body}
              </div>
            </section>
          ))}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
