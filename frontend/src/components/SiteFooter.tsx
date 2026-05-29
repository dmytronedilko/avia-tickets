import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-ink-100 bg-white/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-ink-400 sm:flex-row">
        <div>
          © {new Date().getFullYear()} AviaTickets. All rights reserved.
        </div>
        <div className="flex gap-5">
          <Link href="/terms" className="hover:text-ink-900">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-ink-900">
            Privacy
          </Link>
          <Link href="/cookies" className="hover:text-ink-900">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
