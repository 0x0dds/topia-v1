import type { Metadata } from "next";
import CardsClient from "./cards-client";

export const metadata: Metadata = { title: "Cards — topia" };

export default function CardsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Card Market</h1>
        <p className="mt-1 text-text-muted">
          Browse, filter, and compare prices across the entire catalog.
        </p>
      </div>
      <CardsClient />
    </div>
  );
}
