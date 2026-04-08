# Price Scraper

Scrapes TCGplayer card pages via Cloudflare Browser Rendering and updates variant prices in Supabase.

## Setup

1. Add these env vars to `.env.local`:

```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # optional, for write access
```

2. Add pricing columns to your `variants` table (run in Supabase SQL editor):

```sql
ALTER TABLE variants
  ADD COLUMN IF NOT EXISTS market_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS low_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS last_sold_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS price_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tcgplayer_url TEXT;
```

3. Update the `v_catalog_full` view to include the new columns:

```sql
CREATE OR REPLACE VIEW v_catalog_full AS
SELECT
  s.id AS set_id, s.code AS set_code, s.name AS set_name, s.series, s.release_date,
  c.id AS card_id, c.canonical_name, c.disambiguator, c.supertype, c.subtypes, c.hp, c.types,
  p.id AS printing_id, p.collector_number, p.rarity, p.language, p.image_url,
  v.id AS variant_id, v.finish, v.edition, v.special_marking,
  v.market_price, v.low_price, v.last_sold_price, v.price_updated_at, v.tcgplayer_url
FROM variants v
JOIN printings p ON v.printing_id = p.id
JOIN cards c ON p.card_id = c.id
JOIN sets s ON p.set_id = s.id;
```

4. Populate `tcgplayer_url` on variants you want priced.

## Usage

```bash
# Install tsx if not present
npm install -D tsx

# Run the scraper
npx tsx src/scripts/scrape-prices.ts
```

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `SCRAPE_BATCH_SIZE` | 50 | Variants per run |
| `SCRAPE_DELAY_MS` | 1500 | Delay between scrapes (ms) |

## How it works

1. Fetches variants with `tcgplayer_url` set, ordered by oldest `price_updated_at`
2. For each variant, calls Cloudflare's `/scrape` endpoint to render the TCGplayer page
3. Extracts market, low, and last-sold prices via CSS selectors
4. Updates the variant row in Supabase
5. Retries up to 3x with exponential backoff on failure
