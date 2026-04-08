/** Format a price value for display */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "—";
  return `$${price.toFixed(2)}`;
}

/** Get the lowest market price from a list of catalog entries */
export function getLowestPrice(entries: { market_price: number | null }[]): number | null {
  const prices = entries
    .map((e) => e.market_price)
    .filter((p): p is number => p != null);
  return prices.length > 0 ? Math.min(...prices) : null;
}

/** Get a price range string like "$1.50 - $25.00" */
export function getPriceRange(entries: { market_price: number | null }[]): string {
  const prices = entries
    .map((e) => e.market_price)
    .filter((p): p is number => p != null);
  if (prices.length === 0) return "No price data";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}
