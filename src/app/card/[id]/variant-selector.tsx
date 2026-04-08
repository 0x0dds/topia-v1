"use client";

import { useState, useMemo } from "react";
import { formatPrice } from "@/lib/price";
import type { CatalogEntry } from "@/lib/types";

interface Props {
  entries: CatalogEntry[];
}

interface PrintingGroup {
  printing_id: string;
  set_name: string;
  set_code: string;
  collector_number_raw: string;
  rarity: string | null;
  variants: CatalogEntry[];
}

export default function VariantSelector({ entries }: Props) {
  // Group by printing
  const printings = useMemo(() => {
    const map = new Map<string, PrintingGroup>();
    for (const e of entries) {
      const existing = map.get(e.printing_id);
      if (existing) {
        existing.variants.push(e);
      } else {
        map.set(e.printing_id, {
          printing_id: e.printing_id,
          set_name: e.set_name,
          set_code: e.set_code,
          collector_number_raw: e.collector_number_raw,
          rarity: e.rarity,
          variants: [e],
        });
      }
    }
    return Array.from(map.values());
  }, [entries]);

  const [selectedPrintingId, setSelectedPrintingId] = useState(
    printings[0]?.printing_id ?? ""
  );

  const selectedPrinting = printings.find(
    (p) => p.printing_id === selectedPrintingId
  );

  const [selectedVariantId, setSelectedVariantId] = useState(
    selectedPrinting?.variants[0]?.variant_id ?? ""
  );

  const selectedVariant = selectedPrinting?.variants.find(
    (v) => v.variant_id === selectedVariantId
  );

  const handlePrintingChange = (id: string) => {
    setSelectedPrintingId(id);
    const printing = printings.find((p) => p.printing_id === id);
    if (printing?.variants[0]) {
      setSelectedVariantId(printing.variants[0].variant_id);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Printing selector */}
      <div>
        <h2 className="text-sm font-medium text-text-muted mb-2">Printing</h2>
        <div className="flex flex-wrap gap-2">
          {printings.map((p) => (
            <button
              key={p.printing_id}
              onClick={() => handlePrintingChange(p.printing_id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedPrintingId === p.printing_id
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-text-muted hover:border-border-light hover:text-text"
              }`}
            >
              {p.set_name} #{p.collector_number_raw}
            </button>
          ))}
        </div>
      </div>

      {/* Variant toggle (Holo / Non-Holo / Reverse Holo) */}
      {selectedPrinting && (
        <div>
          <h2 className="text-sm font-medium text-text-muted mb-2">Variant</h2>
          <div className="flex flex-wrap gap-2">
            {selectedPrinting.variants.map((v) => (
              <button
                key={v.variant_id}
                onClick={() => setSelectedVariantId(v.variant_id)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedVariantId === v.variant_id
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-text-muted hover:border-border-light hover:text-text"
                }`}
              >
                <span>{v.finish}</span>
                {v.edition && (
                  <span className="ml-1 text-text-dim">({v.edition})</span>
                )}
                {v.market_price != null && (
                  <span className="ml-2 font-semibold">{formatPrice(v.market_price)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected variant pricing detail */}
      {selectedVariant && (
        <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
          <div className="border-b border-border bg-bg-card px-5 py-3">
            <h3 className="text-sm font-semibold">
              {selectedVariant.finish}
              {selectedVariant.edition && ` — ${selectedVariant.edition}`}
              {selectedVariant.special_marking && ` — ${selectedVariant.special_marking}`}
            </h3>
            <p className="text-xs text-text-dim">
              {selectedVariant.set_name} #{selectedVariant.collector_number_raw}
              {selectedVariant.rarity && ` · ${selectedVariant.rarity}`}
            </p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-text-muted mb-1">Market Price</p>
              <p className={`text-xl font-bold ${selectedVariant.market_price != null ? "text-accent" : "text-text-dim"}`}>
                {formatPrice(selectedVariant.market_price)}
              </p>
            </div>
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-text-muted mb-1">Low</p>
              <p className="text-xl font-bold text-text">
                {formatPrice(selectedVariant.low_price)}
              </p>
            </div>
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-text-muted mb-1">Last Sold</p>
              <p className="text-xl font-bold text-text">
                {formatPrice(selectedVariant.last_sold_price)}
              </p>
            </div>
          </div>

          {selectedVariant.price_updated_at && (
            <div className="border-t border-border px-5 py-2 text-xs text-text-dim">
              Prices updated{" "}
              {new Date(selectedVariant.price_updated_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          )}

          {!selectedVariant.market_price && !selectedVariant.low_price && (
            <div className="border-t border-border px-5 py-3 text-xs text-text-dim">
              No pricing data available yet. Prices update via the scraper pipeline.
            </div>
          )}
        </div>
      )}

      {/* All variants table */}
      {selectedPrinting && selectedPrinting.variants.length > 1 && (
        <div>
          <h2 className="text-sm font-medium text-text-muted mb-2">All Variants</h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-card text-left text-xs text-text-muted">
                  <th className="px-4 py-2.5 font-medium">Finish</th>
                  <th className="px-4 py-2.5 font-medium">Edition</th>
                  <th className="px-4 py-2.5 font-medium text-right">Market</th>
                  <th className="px-4 py-2.5 font-medium text-right">Low</th>
                  <th className="px-4 py-2.5 font-medium text-right">Last Sold</th>
                </tr>
              </thead>
              <tbody>
                {selectedPrinting.variants.map((v) => (
                  <tr
                    key={v.variant_id}
                    onClick={() => setSelectedVariantId(v.variant_id)}
                    className={`border-b border-border last:border-0 cursor-pointer transition-colors ${
                      selectedVariantId === v.variant_id
                        ? "bg-accent-soft"
                        : "hover:bg-bg-card-hover"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-medium">{v.finish}</td>
                    <td className="px-4 py-2.5 text-text-muted">{v.edition ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-accent">
                      {formatPrice(v.market_price)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-text-muted">
                      {formatPrice(v.low_price)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-text-muted">
                      {formatPrice(v.last_sold_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
