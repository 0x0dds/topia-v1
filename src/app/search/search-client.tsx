"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CardImage from "@/components/card-image";
import type { CatalogEntry } from "@/lib/types";

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("v_catalog_full")
        .select("*")
        .ilike("canonical_name", `%${query.trim()}%`)
        .order("canonical_name")
        .limit(60)
        .returns<CatalogEntry[]>();

      // Dedupe to one entry per card_id
      const seen = new Set<string>();
      const unique =
        data?.filter((e) => {
          if (seen.has(e.card_id)) return false;
          seen.add(e.card_id);
          return true;
        }) ?? [];

      setResults(unique);
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="mt-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a Pokémon name..."
        className="w-full rounded-xl border border-border bg-bg-input px-4 py-3 text-sm text-text placeholder:text-text-dim outline-none transition-colors focus:border-accent"
        autoFocus
      />

      {loading && (
        <p className="mt-6 text-sm text-text-muted">Searching...</p>
      )}

      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <p className="mt-6 text-sm text-text-muted">
          No cards found for &ldquo;{query}&rdquo;
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((entry) => (
            <Link
              key={entry.card_id}
              href={`/card/${entry.card_id}`}
              className="group flex flex-col items-center rounded-xl border border-border bg-bg-card p-3 transition-colors hover:border-border-light hover:bg-bg-card-hover"
            >
              <CardImage
                setCode={entry.set_code}
                collectorNumber={entry.collector_number_raw}
                imageSmallUrl={entry.image_small_url}
                name={entry.canonical_name}
                width={180}
                height={252}
                className="transition-transform group-hover:scale-[1.02]"
              />
              <div className="mt-2 w-full text-center">
                <p className="truncate text-sm font-medium">
                  {entry.canonical_name}
                  {entry.disambiguator && (
                    <span className="text-text-dim">
                      {" "}
                      {entry.disambiguator}
                    </span>
                  )}
                </p>
                <p className="text-xs text-text-muted">{entry.set_name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
