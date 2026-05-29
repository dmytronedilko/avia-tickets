import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "AviaTickets",
  description:
    "The terms that govern your use of AviaTickets — bookings, payments, cancellations, and more.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: (
      <>
        <p>
          By accessing or using AviaTickets (the &ldquo;Service&rdquo;) you
          agree to be bound by these Terms. If you do not agree, please do not
          use the Service.
        </p>
      </>
    ),
  },
  {
    title: "2. Eligibility",
    body: (
      <p>
        You must be at least 18 years old, or the age of majority in your
        jurisdiction, to create an account and make bookings. Bookings on behalf
        of minors are the responsibility of the booking adult.
      </p>
    ),
  },
  {
    title: "3. Your account",
    body: (
      <>
        <p>
          You are responsible for keeping your credentials confidential and for
          all activity that occurs under your account. Notify us immediately if
          you suspect unauthorized access.
        </p>
        <p>
          We may suspend or terminate accounts that violate these Terms or that
          are used for fraudulent activity.
        </p>
      </>
    ),
  },
  {
    title: "4. Bookings & payment",
    body: (
      <>
        <p>
          Flight inventory and pricing are provided by airlines and partners.
          Prices can change until a booking is confirmed. Payment is debited
          from your travel balance at confirmation.
        </p>
        <ul>
          <li>A booking is final once a confirmation number is issued.</li>
          <li>
            All fares are shown in US dollars and include taxes shown at
            checkout unless stated otherwise.
          </li>
          <li>
            You are responsible for ensuring passenger names match
            government-issued travel documents.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "5. Cancellations & refunds",
    body: (
      <>
        <p>
          Refund eligibility depends on the fare class and the operating
          airline&rsquo;s policy. AviaTickets passes through whatever refund the
          airline approves; we do not retain a service fee on refunds.
        </p>
        <p>
          To request a cancellation, open the booking from your account and
          choose &ldquo;Cancel ticket&rdquo;. Processing can take up to 10
          business days.
        </p>
      </>
    ),
  },
  {
    title: "6. Schedule changes & disruptions",
    body: (
      <p>
        Airlines may change schedules, gates, or aircraft. We will forward
        notifications as soon as the carrier provides them. AviaTickets is not
        the operator and is not liable for delays, cancellations, or denied
        boarding caused by the airline.
      </p>
    ),
  },
  {
    title: "7. Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful or fraudulent purpose.</li>
          <li>
            Scrape, copy, or resell content from the Service without written
            permission.
          </li>
          <li>
            Interfere with the operation of the Service, including via automated
            requests or denial-of-service attempts.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "8. Intellectual property",
    body: (
      <p>
        The AviaTickets name, logo, design, and code are owned by AviaTickets
        and protected by intellectual property laws. Nothing in these Terms
        grants you a license to use our brand without prior written consent.
      </p>
    ),
  },
  {
    title: "9. Limitation of liability",
    body: (
      <p>
        To the maximum extent permitted by law, AviaTickets is not liable for
        indirect, incidental, or consequential damages arising from your use of
        the Service. Our total liability for any claim is limited to the amount
        you paid for the booking in question.
      </p>
    ),
  },
  {
    title: "10. Changes to these terms",
    body: (
      <p>
        We may update these Terms from time to time. Material changes will be
        announced on this page with a new &ldquo;last updated&rdquo; date.
        Continued use of the Service after an update constitutes acceptance.
      </p>
    ),
  },
  {
    title: "11. Contact",
    body: (
      <p>
        Questions about these Terms? Email{" "}
        <a
          href="mailto:legal@aviatickets.example"
          className="text-ember-600 hover:text-ember-700"
        >
          legal@aviatickets.example
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <SiteHeader variant="solid" />

      <header className="mx-auto max-w-4xl px-6 pb-8 pt-10 sm:pt-14">
        <h1 className="font-display text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
          Terms of Service
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
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-600 [&_a]:underline [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
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
