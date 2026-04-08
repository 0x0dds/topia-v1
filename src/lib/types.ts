/* ── Supabase / Postgres row types ── */

export interface Set {
  id: string;
  code: string;
  name: string;
  series: string | null;
  release_date: string | null;
  total_cards: number | null;
  logo_url: string | null;
  created_at: string;
}

export interface Card {
  id: string;
  canonical_name: string;
  disambiguator: string | null;
  supertype: string | null;   // "Pokémon" | "Trainer" | "Energy"
  subtypes: string[] | null;  // ["Stage 2", "ex"]
  hp: number | null;
  types: string[] | null;     // ["Fire"]
  created_at: string;
}

export interface Printing {
  id: string;
  card_id: string;
  set_id: string;
  collector_number: string;
  rarity: string | null;
  language: string;
  image_url: string | null;
  created_at: string;
}

export interface Variant {
  id: string;
  printing_id: string;
  finish: string;        // "Holo" | "Reverse Holo" | "Non-Holo" etc.
  edition: string | null;
  special_marking: string | null;
  market_price: number | null;
  low_price: number | null;
  last_sold_price: number | null;
  price_updated_at: string | null;
  tcgplayer_url: string | null;
  created_at: string;
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
  subtypes: string[] | null;
  hp: number | null;
  types: string[] | null;
  // printing fields
  printing_id: string;
  collector_number: string;
  rarity: string | null;
  language: string;
  image_url: string | null;
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
