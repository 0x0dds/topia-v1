import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CardImage from "@/components/card-image";
import VariantSelector from "./variant-selector";
import type { Card, CatalogEntry } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { data: card } = await supabase
    .from("cards")
    .select("canonical_name, disambiguator")
    .eq("id", id)
    .single<Pick<Card, "canonical_name" | "disambiguator">>();
  const name = card
    ? `${card.canonical_name}${card.disambiguator ? ` ${card.disambiguator}` : ""}`
    : "Card";
  return { title: `${name} — topia` };
}

export default async function CardDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: card } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .single<Card>();

  if (!card) notFound();

  const { data: entries } = await supabase
    .from("v_catalog_full")
    .select("*")
    .eq("card_id", id)
    .order("set_name", { ascending: true })
    .returns<CatalogEntry[]>();

  const allEntries = entries ?? [];

  // Pick the first printing for the hero image
  const hero = allEntries[0];

  const displayName = `${card.canonical_name}${card.disambiguator ? ` ${card.disambiguator}` : ""}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href={hero ? `/sets/${hero.set_code}` : "/sets"}
        className="text-sm text-text-muted transition-colors hover:text-text"
      >
        &larr; Back to set
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[320px_1fr]">
        {/* Card image */}
        <div className="flex justify-center lg:justify-start">
          {hero ? (
            <CardImage
              setCode={hero.set_code}
              collectorNumber={hero.collector_number}
              fallbackUrl={hero.image_url}
              name={displayName}
              width={300}
              height={419}
              priority
            />
          ) : (
            <div className="flex h-[419px] w-[300px] items-center justify-center rounded-lg bg-bg-card text-text-dim">
              No image
            </div>
          )}
        </div>

        {/* Card info */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {card.canonical_name}
            {card.disambiguator && (
              <span className="ml-2 text-text-muted">{card.disambiguator}</span>
            )}
          </h1>

          <div className="mt-3 flex flex-wrap gap-2">
            {card.supertype && (
              <span className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text-muted">
                {card.supertype}
              </span>
            )}
            {card.subtypes?.map((st) => (
              <span
                key={st}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text-muted"
              >
                {st}
              </span>
            ))}
            {card.hp && (
              <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                {card.hp} HP
              </span>
            )}
          </div>

          {card.types && card.types.length > 0 && (
            <div className="mt-3 flex gap-2">
              {card.types.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-bg-card px-3 py-1 text-xs font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Variant selector (client component) */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Variants</h2>
            <VariantSelector entries={allEntries} />
          </div>
        </div>
      </div>
    </div>
  );
}
