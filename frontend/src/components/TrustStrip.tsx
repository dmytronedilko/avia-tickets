const ITEMS = [
  {
    stat: "$0",
    statLabel: "hidden fees",
    title: "Price guarantee",
    desc: "Find a lower fare within 24h and we refund the difference.",
  },
  {
    stat: "47s",
    statLabel: "avg. response",
    title: "Human support",
    desc: "Real agents answer around the clock, in your language.",
  },
  {
    stat: "10s",
    statLabel: "to your inbox",
    title: "Instant ticket",
    desc: "Your boarding pass is issued the moment you book.",
  },
];

export default function TrustStrip() {
  return (
    <section className="mt-16">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-ink-100 ring-1 ring-ink-100 sm:grid-cols-3">
        {ITEMS.map(({ stat, statLabel, title, desc }) => (
          <div
            key={title}
            className="group relative bg-white p-7 transition hover:bg-ink-50/60 sm:p-8"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold tracking-tight text-ink-900 sm:text-6xl">
                {stat}
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-ink-400">
                {statLabel}
              </span>
            </div>

            <div className="mt-5 h-px w-10 bg-ember-500 transition-all duration-300 group-hover:w-16" />

            <h3 className="mt-5 font-display text-base font-semibold text-ink-900">
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
