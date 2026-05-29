import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "AviaTickets",
  description:
    "Search and book flights to destinations worldwide. Best fares, instant confirmation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-ink-50 font-sans text-ink-900 antialiased selection:bg-ember-200 selection:text-ink-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
