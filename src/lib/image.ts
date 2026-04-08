/**
 * Build a pokemontcg.io image URL from set code + collector number.
 * Falls back to provided image URLs if available.
 *
 * Set code mapping: our codes may differ from pokemontcg.io codes.
 * Add overrides here as needed.
 */

const SET_CODE_MAP: Record<string, string> = {
  SV151: "sv3pt5",
  BS: "base1",
  JU: "jungle",
  FO: "fossil",
};

export function getCardImageUrl(
  setCode: string,
  collectorNumber: string,
  fallbackUrl?: string | null
): string {
  if (fallbackUrl) return fallbackUrl;
  const mapped = SET_CODE_MAP[setCode] ?? setCode.toLowerCase();
  return `https://images.pokemontcg.io/${mapped}/${collectorNumber}.png`;
}

export function getCardImageUrlHiRes(
  setCode: string,
  collectorNumber: string,
  fallbackUrl?: string | null
): string {
  if (fallbackUrl) return fallbackUrl;
  const mapped = SET_CODE_MAP[setCode] ?? setCode.toLowerCase();
  return `https://images.pokemontcg.io/${mapped}/${collectorNumber}_hires.png`;
}
