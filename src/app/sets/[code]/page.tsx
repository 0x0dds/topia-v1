import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CardImage from "@/components/card-image";
import type { Set as SetType, CatalogEntry } from "@/lib/types";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  const { data: set } = await supabase
    .from("sets")
    .select("name")
    .eq("set_code", code)
    .single<Pick<SetType, "name">>();
  return { title: set ? `${set.name} — topia` : "Set — topia" };
}

export default async function SetDetailPage({ params }: Props) {
  const { code } = await params;

  const { data: set } = await supabase
    .from("sets")
    .select("*")
    .eq("set_code", code)
    .single<SetType>();

  if (!set) notFound();

  // Get unique printings for this set
  const { data: entries } = await supabase
    .from("v_catalog_full")
    .select("*")
    .eq("set_code", code)
    .order("collector_number_raw", { ascending: true })
    .returns<CatalogEntry[]>();

  // Dedupe to one entry per printing (first variant)
  const seen = new Set<string>();
  const uniquePrintings = entries?.filter((e) => {
    if (seen.has(e.printing_id)) return false;
    seen.add(e.printing_id);
    return true;
  }) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <Link
          href="/sets"
          className="text-sm text-text-muted transition-colors hover:text-text"
        >
          &larr; All Sets
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {set.name}
          </h1>
          <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
            {set.set_code}
          </span>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          {uniquePrintings.length} cards
          {set.release_date &&
            ` · Released ${new Date(set.release_date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {uniquePrintings.map((entry) => (
          <Link
            key={entry.printing_id}
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
                  <span className="text-text-dim"> {entry.disambiguator}</span>
                )}
              </p>
              <p className="text-xs text-text-muted">
                #{entry.collector_number_raw}
                {entry.rarity && ` · ${entry.rarity}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
