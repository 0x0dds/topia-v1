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
  const hero = allEntries[0];
  const displayName = `${card.canonical_name}${card.disambiguator ? ` ${card.disambiguator}` : ""}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href={hero ? `/sets/${hero.set_code}` : "/cards"}
        className="text-sm text-text-muted transition-colors hover:text-text"
      >
        &larr; Back to {hero ? hero.set_name : "cards"}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[320px_1fr]">
        {/* Card image */}
        <div className="flex justify-center lg:sticky lg:top-20 lg:self-start">
          {hero ? (
            <CardImage
              setCode={hero.set_code}
              collectorNumber={hero.collector_number_raw}
              imageSmallUrl={hero.image_small_url}
              imageLargeUrl={hero.image_large_url}
              name={displayName}
              size="large"
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

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            {card.supertype && (
              <span className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text-muted">
                {card.supertype}
              </span>
            )}
            {card.subtype && (
              <span className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text-muted">
                {card.subtype}
              </span>
            )}
            {card.hp && (
              <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                {card.hp} HP
              </span>
            )}
            {card.energy_type && (
              <span className="rounded-full bg-bg-card px-3 py-1 text-xs font-medium">
                {card.energy_type}
              </span>
            )}
          </div>

          {card.description && (
            <p className="mt-4 text-sm text-text-muted">{card.description}</p>
          )}

          {/* Variant selector with pricing */}
          <VariantSelector entries={allEntries} />
        </div>
      </div>
    </div>
  );
}
