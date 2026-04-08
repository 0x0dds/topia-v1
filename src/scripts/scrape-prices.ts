/**
 * Price scraper script.
 *
 * Reads variants with tcgplayer_url from Supabase, scrapes prices
 * via Cloudflare Browser Rendering, and updates the variants table.
 *
 * Usage:
 *   npx tsx src/scripts/scrape-prices.ts
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  (or SUPABASE_SERVICE_ROLE_KEY for writes)
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_API_TOKEN
 *
 * Optional:
 *   SCRAPE_BATCH_SIZE  — how many variants per run (default: 50)
 *   SCRAPE_DELAY_MS    — delay between scrapes in ms (default: 1500)
 */

import { createClient } from "@supabase/supabase-js";
import { scrapePriceWithRetry } from "../lib/scraper";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Prefer service role key for writes; fall back to anon key
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const BATCH_SIZE = parseInt(process.env.SCRAPE_BATCH_SIZE ?? "50", 10);
const DELAY_MS = parseInt(process.env.SCRAPE_DELAY_MS ?? "1500", 10);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("🔍 Fetching variants with TCGplayer URLs...");

  // Get variants that have a tcgplayer_url, ordered by least recently priced
  const { data: variants, error } = await supabase
    .from("variants")
    .select("id, printing_id, finish, edition, tcgplayer_url, price_updated_at")
    .not("tcgplayer_url", "is", null)
    .order("price_updated_at", { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE);

  if (error) {
    console.error("❌ Failed to fetch variants:", error.message);
    process.exit(1);
  }

  if (!variants || variants.length === 0) {
    console.log("✅ No variants with TCGplayer URLs found. Nothing to scrape.");
    return;
  }

  console.log(`📦 Found ${variants.length} variants to scrape.\n`);

  let success = 0;
  let failed = 0;

  for (const variant of variants) {
    const label = `[${variant.id}] ${variant.finish}${variant.edition ? ` (${variant.edition})` : ""}`;

    try {
      console.log(`⏳ Scraping ${label}...`);
      const prices = await scrapePriceWithRetry(variant.tcgplayer_url!);

      const { error: updateError } = await supabase
        .from("variants")
        .update({
          market_price: prices.market_price,
          low_price: prices.low_price,
          last_sold_price: prices.last_sold_price,
          price_updated_at: new Date().toISOString(),
        })
        .eq("id", variant.id);

      if (updateError) {
        console.error(`  ❌ DB update failed: ${updateError.message}`);
        failed++;
      } else {
        console.log(
          `  ✅ Market: ${prices.market_price ?? "—"} | Low: ${prices.low_price ?? "—"} | Last Sold: ${prices.last_sold_price ?? "—"}`
        );
        success++;
      }
    } catch (err) {
      console.error(`  ❌ Scrape failed: ${err instanceof Error ? err.message : err}`);
      failed++;
    }

    // Rate limit between scrapes
    await sleep(DELAY_MS);
  }

  console.log(`\n🏁 Done. Success: ${success} | Failed: ${failed}`);
}

main();
