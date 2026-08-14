const SQM_PER_TSUBO = 400 / 121;

export function tsuboToSqm(tsubo: number): number {
  return tsubo * SQM_PER_TSUBO;
}

export function sqmToTsubo(sqm: number): number {
  return sqm / SQM_PER_TSUBO;
}
