import type { Metadata } from "next";
import SearchClient from "./search-client";

export const metadata: Metadata = { title: "Search — topia" };

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Search</h1>
      <p className="mt-1 text-text-muted">
        Search by card name across the entire catalog.
      </p>
      <SearchClient />
    </div>
  );
}
