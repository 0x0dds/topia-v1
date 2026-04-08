"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CardImage from "@/components/card-image";
import { formatPrice, getLowestPrice, getPriceRange } from "@/lib/price";
import type { CatalogEntry, Set } from "@/lib/types";

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "newest";
type ViewMode = "grid" | "list";

const PAGE_SIZE = 40;

interface CardGroup {
  card_id: string;
  canonical_name: string;
  disambiguator: string | null;
  supertype: string | null;
  types: string[] | null;
  rarity: string | null;
  set_code: string;
  set_name: string;
  collector_number: string;
  image_url: string | null;
  entries: CatalogEntry[];
  lowestPrice: number | null;
}

export default function CardsClient() {
  const [cards, setCards] = useState<CardGroup[]>([]);
  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedSet, setSelectedSet] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [view, setView] = useState<ViewMode>("grid");

  // Load sets for filter dropdown
  useEffect(() => {
    supabase
      .from("sets")
      .select("*")
      .order("name")
      .returns<Set[]>()
      .then(({ data }) => setSets(data ?? []));
  }, []);

  const fetchCards = useCallback(
    async (pageNum: number, append: boolean) => {
      setLoading(true);

      let query = supabase
        .from("v_catalog_full")
        .select("*")
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (search.trim().length >= 2) {
        query = query.ilike("canonical_name", `%${search.trim()}%`);
      }
      if (selectedSet) {
        query = query.eq("set_code", selectedSet);
      }
      if (selectedType) {
        query = query.contains("types", [selectedType]);
      }
      if (selectedRarity) {
        query = query.eq("rarity", selectedRarity);
      }

      // Sort
      switch (sort) {
        case "name-asc":
          query = query.order("canonical_name", { ascending: true });
          break;
        case "name-desc":
          query = query.order("canonical_name", { ascending: false });
          break;
        case "price-asc":
          query = query.order("market_price", { ascending: true, nullsFirst: false });
          break;
        case "price-desc":
          query = query.order("market_price", { ascending: false, nullsFirst: true });
          break;
        case "newest":
          query = query.order("release_date", { ascending: false });
          break;
      }

      const { data } = await query.returns<CatalogEntry[]>();
      const entries = data ?? [];

      // Group by card_id
      const map = new Map<string, CardGroup>();
      for (const e of entries) {
        const existing = map.get(e.card_id);
        if (existing) {
          existing.entries.push(e);
          const lp = getLowestPrice(existing.entries);
          existing.lowestPrice = lp;
        } else {
          map.set(e.card_id, {
            card_id: e.card_id,
            canonical_name: e.canonical_name,
            disambiguator: e.disambiguator,
            supertype: e.supertype,
            types: e.types,
            rarity: e.rarity,
            set_code: e.set_code,
            set_name: e.set_name,
            collector_number: e.collector_number,
            image_url: e.image_url,
            entries: [e],
            lowestPrice: e.market_price,
          });
        }
      }

      const grouped = Array.from(map.values());
      setCards(append ? (prev) => [...prev, ...grouped] : grouped);
      setHasMore(entries.length === PAGE_SIZE);
      setLoading(false);
    },
    [search, selectedSet, selectedType, selectedRarity, sort]
  );

  // Reset and fetch when filters change
  useEffect(() => {
    setPage(0);
    fetchCards(0, false);
  }, [fetchCards]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchCards(next, true);
  };

  return (
    <div>
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-bg-card p-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cards..."
          className="min-w-[180px] flex-1 rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text placeholder:text-text-dim outline-none focus:border-accent"
        />
        <select
          value={selectedSet}
          onChange={(e) => setSelectedSet(e.target.value)}
          className="rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          <option value="">All Sets</option>
          {sets.map((s) => (
            <option key={s.id} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          <option value="">All Types</option>
          {["Fire", "Water", "Grass", "Electric", "Psychic", "Fighting", "Darkness", "Metal", "Dragon", "Fairy", "Colorless"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={selectedRarity}
          onChange={(e) => setSelectedRarity(e.target.value)}
          className="rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          <option value="">All Rarities</option>
          {["Common", "Uncommon", "Rare", "Rare Holo", "Rare Holo EX", "Rare Ultra", "Rare Secret", "Double Rare", "Illustration Rare", "Special Art Rare", "Hyper Rare"].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="price-asc">Price Low-High</option>
          <option value="price-desc">Price High-Low</option>
          <option value="newest">Newest</option>
        </select>

        {/* View toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              view === "grid" ? "bg-accent text-white" : "text-text-muted hover:text-text"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              view === "list" ? "bg-accent text-white" : "text-text-muted hover:text-text"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Results */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {cards.map((card) => (
            <Link
              key={card.card_id}
              href={`/card/${card.card_id}`}
              className="group flex flex-col items-center rounded-xl border border-border bg-bg-card p-3 transition-all hover:border-border-light hover:bg-bg-card-hover"
            >
              <CardImage
                setCode={card.set_code}
                collectorNumber={card.collector_number}
                fallbackUrl={card.image_url}
                name={card.canonical_name}
                width={170}
                height={238}
                className="transition-transform group-hover:scale-[1.03]"
              />
              <div className="mt-2 w-full text-center">
                <p className="truncate text-sm font-medium">
                  {card.canonical_name}
                  {card.disambiguator && (
                    <span className="text-text-dim"> {card.disambiguator}</span>
                  )}
                </p>
                <p className="text-xs text-text-muted">{card.set_name}</p>
                {card.lowestPrice != null ? (
                  <p className="mt-1 text-sm font-semibold text-accent">
                    from {formatPrice(card.lowestPrice)}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-text-dim">No price data</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-card text-left text-xs text-text-muted">
                <th className="px-4 py-3 font-medium">Card</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Set</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Type</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Rarity</th>
                <th className="px-4 py-3 font-medium text-right">Market Price</th>
                <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">Variants</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr
                  key={card.card_id}
                  className="border-b border-border last:border-0 hover:bg-bg-card-hover transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/card/${card.card_id}`}
                      className="font-medium hover:text-accent transition-colors"
                    >
                      {card.canonical_name}
                      {card.disambiguator && (
                        <span className="text-text-dim"> {card.disambiguator}</span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-muted hidden sm:table-cell">
                    {card.set_name}
                  </td>
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                    {card.types?.join(", ") ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                    {card.rarity ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {card.lowestPrice != null ? (
                      <span className="text-accent">{formatPrice(card.lowestPrice)}</span>
                    ) : (
                      <span className="text-text-dim">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-text-muted hidden sm:table-cell">
                    {card.entries.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Load more */}
      {loading && (
        <div className="mt-8 flex justify-center">
          <p className="text-sm text-text-muted">Loading cards...</p>
        </div>
      )}
      {!loading && hasMore && cards.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-muted transition-colors hover:border-border-light hover:text-text"
          >
            Load More
          </button>
        </div>
      )}
      {!loading && cards.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-text-muted">No cards match your filters.</p>
        </div>
      )}
    </div>
  );
}
