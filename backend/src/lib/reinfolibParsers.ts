/** Parsers for reinfolib's Japanese, unit-suffixed string fields (e.g. "80.0%", "7,500万円", "40㎡"). */

export function parsePercent(value: string | undefined | null): number | null {
  if (!value) return null;
  const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export function parseAreaSqm(value: string | undefined | null): number | null {
  if (!value) return null;
  const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

/** Parses a Japanese price string like "7,500万円" or "1億2,300万円" into yen. */
export function parsePriceYen(value: string | undefined | null): number | null {
  if (!value) return null;
  const cleaned = value.replace(/,/g, "");
  const okuMatch = cleaned.match(/(\d+(\.\d+)?)億/);
  const manMatch = cleaned.match(/(\d+(\.\d+)?)万/);
  if (!okuMatch && !manMatch) return null;

  const oku = okuMatch ? Number(okuMatch[1]) : 0;
  const man = manMatch ? Number(manMatch[1]) : 0;
  return oku * 100_000_000 + man * 10_000;
}

/** Parses "2024年第4四半期" into { year: 2024, quarter: 4 }. */
export function parsePointInTime(
  value: string | undefined | null
): { year: number; quarter: number } | null {
  if (!value) return null;
  const match = value.match(/(\d{4})年第(\d)四半期/);
  if (!match) return null;
  return { year: Number(match[1]), quarter: Number(match[2]) };
}
