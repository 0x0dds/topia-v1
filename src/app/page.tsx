import Link from "next/link";
import { supabase } from "@/lib/supabase";

async function getStats() {
  const [sets, cards, printings, variants] = await Promise.all([
    supabase.from("sets").select("*", { count: "exact", head: true }),
    supabase.from("cards").select("*", { count: "exact", head: true }),
    supabase.from("printings").select("*", { count: "exact", head: true }),
    supabase.from("variants").select("*", { count: "exact", head: true }),
  ]);
  return {
    sets: sets.count ?? 0,
    cards: cards.count ?? 0,
    printings: printings.count ?? 0,
    variants: variants.count ?? 0,
  };
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
          Every card. Every variant.
          <br />
          <span className="text-accent">One catalog.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-text-muted">
          Browse the complete Pokémon TCG database — sets, cards, printings, and
          variant-level detail for collectors and competitors.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/sets"
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Browse Sets
          </Link>
          <Link
            href="/search"
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-text-muted transition-colors hover:border-border-light hover:text-text"
          >
            Search Cards
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {([
          ["Sets", stats.sets],
          ["Cards", stats.cards],
          ["Printings", stats.printings],
          ["Variants", stats.variants],
        ] as const).map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-bg-card p-6 text-center"
          >
            <p className="text-3xl font-bold tabular-nums">{value.toLocaleString()}</p>
            <p className="mt-1 text-sm text-text-muted">{label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
