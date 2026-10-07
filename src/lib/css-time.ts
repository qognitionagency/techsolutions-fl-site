/**
 * A CSS <time> custom property in milliseconds. The production CSS minifier rewrites `4200ms`
 * as `4.2s`, so parseFloat alone is off by 1000× (the hero phone once cycled every 4.2 ms).
 * Returns `fallback` for empty, unitless, non-positive or unparseable values.
 */
export function cssMs(value: string, fallback: number): number {
  const m = /^\s*([\d.]+)(ms|s)\s*$/i.exec(value);
  if (!m) return fallback;
  const n = parseFloat(m[1]!) * (m[2]!.toLowerCase() === 's' ? 1000 : 1);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
