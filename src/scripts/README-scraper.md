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

3. Create or replace the `v_catalog_full` view to include the new columns:

```sql
CREATE OR REPLACE VIEW v_catalog_full AS
SELECT
  s.id AS set_id, s.set_code, s.name AS set_name, s.series, s.release_date,
  c.id AS card_id, c.canonical_name, c.disambiguator, c.supertype, c.subtype, c.energy_type, c.hp,
  p.id AS printing_id, p.collector_number_raw, p.rarity, p.language, p.artist, p.image_small_url, p.image_large_url,
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
npx tsx src/scripts/scrape-prices.ts
```

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `SCRAPE_BATCH_SIZE` | 50 | Variants per run |
| `SCRAPE_DELAY_MS` | 1500 | Delay between scrapes (ms) |
