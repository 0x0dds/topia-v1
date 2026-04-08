/* ── Supabase / Postgres row types ── */

export interface Set {
  id: string;
  set_code: string;
  name: string;
  series: string | null;
  total_cards: number | null;
  release_date: string | null;
  set_type: string | null;
  ptcgo_code: string | null;
  logo_url: string | null;
  symbol_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  canonical_name: string;
  disambiguator: string | null;
  supertype: string | null;   // "Pokémon" | "Trainer" | "Energy"
  subtype: string | null;     // "Stage 2", "ex", etc. (enum)
  energy_type: string | null; // "Fire", "Water", etc.
  hp: number | null;
  description: string | null;
  rules_text: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Printing {
  id: string;
  card_id: string;
  set_id: string;
  collector_number_raw: string;
  collector_number_sort: string;
  language: string;
  rarity: string | null;
  artist: string | null;
  flavor_text: string | null;
  image_small_url: string | null;
  image_large_url: string | null;
  source_url: string | null;
  source_scraped_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Variant {
  id: string;
  printing_id: string;
  finish: string;        // "Holo" | "Reverse Holo" | "Non-Holo" etc.
  edition: string | null;
  special_marking: string | null;
  is_standard_variant: boolean;
  notes: string | null;
  market_price: number | null;
  low_price: number | null;
  last_sold_price: number | null;
  price_updated_at: string | null;
  tcgplayer_url: string | null;
  created_at: string;
  updated_at: string;
}

/* ── v_catalog_full view (joins all 4 tables) ── */

export interface CatalogEntry {
  // set fields
  set_id: string;
  set_code: string;
  set_name: string;
  series: string | null;
  release_date: string | null;
  // card fields
  card_id: string;
  canonical_name: string;
  disambiguator: string | null;
  supertype: string | null;
  subtype: string | null;
  energy_type: string | null;
  hp: number | null;
  // printing fields
  printing_id: string;
  collector_number_raw: string;
  rarity: string | null;
  language: string;
  artist: string | null;
  image_small_url: string | null;
  image_large_url: string | null;
  // variant fields
  variant_id: string;
  finish: string;
  edition: string | null;
  special_marking: string | null;
  market_price: number | null;
  low_price: number | null;
  last_sold_price: number | null;
  price_updated_at: string | null;
  tcgplayer_url: string | null;
}

/* ── Homepage stats ── */

export interface CatalogStats {
  sets: number;
  cards: number;
  printings: number;
  variants: number;
}
