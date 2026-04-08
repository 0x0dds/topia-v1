import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Set } from "@/lib/types";

export const metadata = { title: "Sets — topia" };

export default async function SetsPage() {
  const { data: sets } = await supabase
    .from("sets")
    .select("*")
    .order("release_date", { ascending: false })
    .returns<Set[]>();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Sets</h1>
      <p className="mt-1 text-text-muted">
        {sets?.length ?? 0} sets in the catalog
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sets?.map((set) => (
          <Link
            key={set.id}
            href={`/sets/${set.set_code}`}
            className="group rounded-xl border border-border bg-bg-card p-5 transition-colors hover:border-border-light hover:bg-bg-card-hover"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold group-hover:text-accent transition-colors">
                  {set.name}
                </h2>
                {set.series && (
                  <p className="mt-0.5 text-xs text-text-dim">{set.series}</p>
                )}
              </div>
              <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                {set.set_code}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
              {set.total_cards && <span>{set.total_cards} cards</span>}
              {set.release_date && (
                <span>{new Date(set.release_date).getFullYear()}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
