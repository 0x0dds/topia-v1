"use client";

import { useState, useMemo } from "react";
import type { CatalogEntry } from "@/lib/types";

interface Props {
  entries: CatalogEntry[];
}

export default function VariantSelector({ entries }: Props) {
  // Group by printing, then list variants under each
  const printings = useMemo(() => {
    const map = new Map<
      string,
      { printing: CatalogEntry; variants: CatalogEntry[] }
    >();
    for (const e of entries) {
      const existing = map.get(e.printing_id);
      if (existing) {
        existing.variants.push(e);
      } else {
        map.set(e.printing_id, { printing: e, variants: [e] });
      }
    }
    return Array.from(map.values());
  }, [entries]);

  const [selectedPrintingId, setSelectedPrintingId] = useState(
    printings[0]?.printing.printing_id ?? ""
  );

  const selectedPrinting = printings.find(
    (p) => p.printing.printing_id === selectedPrintingId
  );

  return (
    <div className="mt-3 space-y-4">
      {/* Printing tabs */}
      <div className="flex flex-wrap gap-2">
        {printings.map(({ printing }) => (
          <button
            key={printing.printing_id}
            onClick={() => setSelectedPrintingId(printing.printing_id)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedPrintingId === printing.printing_id
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-text-muted hover:border-border-light hover:text-text"
            }`}
          >
            {printing.set_name} #{printing.collector_number}
            {printing.rarity && ` · ${printing.rarity}`}
          </button>
        ))}
      </div>

      {/* Variants table */}
      {selectedPrinting && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-card text-left text-xs text-text-muted">
                <th className="px-4 py-2.5 font-medium">Finish</th>
                <th className="px-4 py-2.5 font-medium">Edition</th>
                <th className="px-4 py-2.5 font-medium">Special</th>
              </tr>
            </thead>
            <tbody>
              {selectedPrinting.variants.map((v) => (
                <tr
                  key={v.variant_id}
                  className="border-b border-border last:border-0 hover:bg-bg-card-hover transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium">{v.finish}</td>
                  <td className="px-4 py-2.5 text-text-muted">
                    {v.edition ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-text-muted">
                    {v.special_marking ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
