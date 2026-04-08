import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CardImage from "@/components/card-image";
import type { Set, CatalogEntry } from "@/lib/types";
import { formatPrice } from "@/lib/price";

async function getHomeData() {
  const [setsCount, cardsCount, printingsCount, variantsCount, recentSets, recentCards] =
    await Promise.all([
      supabase.from("sets").select("*", { count: "exact", head: true }),
      supabase.from("cards").select("*", { count: "exact", head: true }),
      supabase.from("printings").select("*", { count: "exact", head: true }),
      supabase.from("variants").select("*", { count: "exact", head: true }),
      supabase
        .from("sets")
        .select("*")
        .order("release_date", { ascending: false })
        .limit(4)
        .returns<Set[]>(),
      supabase
        .from("v_catalog_full")
        .select("*")
        .order("card_id", { ascending: false })
        .limit(50)
        .returns<CatalogEntry[]>(),
    ]);

  // Dedupe recent cards to unique card_ids
  const seen = new Set<string>();
  const uniqueCards =
    recentCards.data?.filter((e) => {
      if (seen.has(e.card_id)) return false;
      seen.add(e.card_id);
      return true;
    }) ?? [];

  return {
    stats: {
      sets: setsCount.count ?? 0,
      cards: cardsCount.count ?? 0,
      printings: printingsCount.count ?? 0,
      variants: variantsCount.count ?? 0,
    },
    recentSets: recentSets.data ?? [],
    recentCards: uniqueCards.slice(0, 8),
  };
}

export default async function HomePage() {
  const { stats, recentSets, recentCards } = await getHomeData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="mb-16">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          The complete Pokémon
          <br />
          TCG <span className="text-accent">price catalog</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-muted">
          Track market prices across{" "}
          <span className="text-text font-medium">{stats.variants.toLocaleString()} variants</span>{" "}
          from{" "}
          <span className="text-text font-medium">{stats.cards.toLocaleString()} cards</span>{" "}
          spanning{" "}
          <span className="text-text font-medium">{stats.sets.toLocaleString()} sets</span>.
          Every holo, reverse holo, and special print — cataloged with
          variant-level pricing.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/cards"
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Browse Cards
          </Link>
          <Link
            href="/search"
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-text-muted transition-colors hover:border-border-light hover:text-text"
          >
            Search Catalog
          </Link>
        </div>
      </section>

      {/* Recent Sets */}
      {recentSets.length > 0 && (
        <section className="mb-14">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="font-display text-xl font-bold">Latest Sets</h2>
              <p className="text-sm text-text-muted mt-0.5">Recently released expansions</p>
            </div>
            <Link href="/sets" className="text-sm text-accent hover:text-accent-hover transition-colors">
              View all &rarr;
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentSets.map((set) => (
              <Link
                key={set.id}
                href={`/sets/${set.code}`}
                className="group rounded-xl border border-border bg-bg-card p-5 transition-all hover:border-border-light hover:bg-bg-card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent font-bold text-sm">
                    {set.code}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-sm group-hover:text-accent transition-colors">
                      {set.name}
                    </h3>
                    <p className="text-xs text-text-dim">
                      {set.total_cards ? `${set.total_cards} cards` : ""}
                      {set.total_cards && set.release_date ? " · " : ""}
                      {set.release_date
                        ? new Date(set.release_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
                {set.series && (
                  <p className="mt-3 text-xs text-text-muted">
                    {set.series} series
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently Added Cards */}
      {recentCards.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="font-display text-xl font-bold">Recently Added</h2>
              <p className="text-sm text-text-muted mt-0.5">Latest cards in the catalog</p>
            </div>
            <Link href="/cards" className="text-sm text-accent hover:text-accent-hover transition-colors">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {recentCards.map((entry) => (
              <Link
                key={entry.card_id}
                href={`/card/${entry.card_id}`}
                className="group flex flex-col items-center rounded-xl border border-border bg-bg-card p-3 transition-all hover:border-border-light hover:bg-bg-card-hover"
              >
                <CardImage
                  setCode={entry.set_code}
                  collectorNumber={entry.collector_number}
                  fallbackUrl={entry.image_url}
                  name={entry.canonical_name}
                  width={160}
                  height={224}
                  className="transition-transform group-hover:scale-[1.03]"
                />
                <div className="mt-2 w-full text-center">
                  <p className="truncate text-sm font-medium">
                    {entry.canonical_name}
                    {entry.disambiguator && (
                      <span className="text-text-dim"> {entry.disambiguator}</span>
                    )}
                  </p>
                  <p className="text-xs text-text-muted">{entry.set_name}</p>
                  {entry.market_price != null && (
                    <p className="mt-1 text-sm font-semibold text-accent">
                      {formatPrice(entry.market_price)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
