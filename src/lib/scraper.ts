/**
 * Cloudflare Browser Rendering /scrape endpoint client.
 *
 * Scrapes TCGplayer card pages to extract market prices.
 * Requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN env vars.
 *
 * Docs: https://developers.cloudflare.com/browser-rendering/rest-api/scrape-endpoint/
 */

const CF_API_BASE = "https://api.cloudflare.com/client/v4/accounts";

interface ScrapeElement {
  selector: string;
}

interface ScrapeRequest {
  url: string;
  elements: ScrapeElement[];
  waitForSelector?: string;
}

interface ScrapeResultElement {
  results: {
    text: string;
    html: string;
    attributes: Record<string, string>[];
    width: number;
    height: number;
  }[];
}

interface ScrapeResponse {
  success: boolean;
  result: ScrapeResultElement[];
}

export interface ScrapedPrice {
  market_price: number | null;
  low_price: number | null;
  last_sold_price: number | null;
}

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env var: ${key}`);
  return val;
}

function parsePrice(text: string): number | null {
  const match = text.match(/\$?([\d,]+\.?\d*)/);
  if (!match) return null;
  return parseFloat(match[1].replace(",", ""));
}

/**
 * Scrape a single TCGplayer product page for prices.
 */
export async function scrapeTCGplayerPrices(
  tcgplayerUrl: string
): Promise<ScrapedPrice> {
  const accountId = getEnv("CLOUDFLARE_ACCOUNT_ID");
  const apiToken = getEnv("CLOUDFLARE_API_TOKEN");

  const body: ScrapeRequest = {
    url: tcgplayerUrl,
    elements: [
      // TCGplayer price selectors — these may need updating if their DOM changes
      { selector: ".price-point__data--market .price-point__price" },
      { selector: ".price-point__data--low .price-point__price" },
      { selector: ".price-point__data--last-sold .price-point__price" },
    ],
    waitForSelector: ".price-point__price",
  };

  const res = await fetch(
    `${CF_API_BASE}/${accountId}/browser-rendering/scrape`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudflare scrape failed (${res.status}): ${text}`);
  }

  const data: ScrapeResponse = await res.json();

  if (!data.success || !data.result) {
    throw new Error("Cloudflare scrape returned unsuccessful response");
  }

  const [marketEl, lowEl, lastSoldEl] = data.result;

  return {
    market_price: parsePrice(marketEl?.results?.[0]?.text ?? ""),
    low_price: parsePrice(lowEl?.results?.[0]?.text ?? ""),
    last_sold_price: parsePrice(lastSoldEl?.results?.[0]?.text ?? ""),
  };
}

/**
 * Scrape prices with retry + rate limiting.
 */
export async function scrapePriceWithRetry(
  tcgplayerUrl: string,
  maxRetries = 3
): Promise<ScrapedPrice> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await scrapeTCGplayerPrices(tcgplayerUrl);
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      // Exponential backoff: 2s, 4s, 8s
      await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt)));
    }
  }
  // Unreachable but TS needs it
  throw new Error("Max retries exceeded");
}
