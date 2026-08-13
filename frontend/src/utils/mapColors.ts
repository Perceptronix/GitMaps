/**
 * OKLCH color blending utilities for GitMaps canvas renderer.
 * Ported from AlphaXiv's Gaussian-weighted hue blending (map-CUr2xV3D.js lines 154-216).
 */

// OKLCH constants — matched to AlphaXiv's map-CUr2xV3D.js
// dark=true (map dots): L=0.72, C=0.15  → vivid, saturated dot colors
// dark=false (labels):  L=0.82, C=0.17  → slightly brighter for text readability
const DEFAULT_LIGHTNESS = 0.82; // label text (bright)
const DEFAULT_CHROMA    = 0.17;
const DARK_LIGHTNESS    = 0.72; // map dots
const DARK_CHROMA       = 0.15;

// Domain hue mapping — evenly spaced around color wheel (matching AlphaXiv)
const DOMAIN_HUES: Record<string, number> = {
  AI: 25,
  'AI Agents': 55,
  RAG: 85,
  'Machine Learning': 115,
  Frontend: 175,
  Backend: 205,
  DevOps: 235,
  Cybersecurity: 265,
  'Data Engineering': 295,
  Mobile: 325,
  'Game Development': 355,
  Blockchain: 15,
  Networking: 45,
  Cloud: 75,
  Databases: 105,
};

// Fallback hues for unknown domains
const FALLBACK_HUES = [
  25, 55, 85, 115, 145, 175, 205, 235, 265, 295, 325, 355,
];

/**
 * Convert hue angle (degrees) to OKLCH color string.
 */
export function hueToOklch(hue: number, isDark = false): string {
  const L = isDark ? DARK_LIGHTNESS : DEFAULT_LIGHTNESS;
  const C = isDark ? DARK_CHROMA : DEFAULT_CHROMA;
  return `oklch(${L} ${C} ${hue})`;
}

/**
 * Convert Cartesian (cos, sin) sums to hue angle in degrees.
 */
export function hueFromVector(cosSum: number, sinSum: number): number {
  let hue = (Math.atan2(sinSum, cosSum) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  return hue;
}

/**
 * Compute Gaussian weight for distance squared.
 * Matches AlphaXiv: weight = exp(-d2 / (2 * sigma2))
 */
export function gaussianWeight(d2: number, sigma2: number): number {
  return Math.exp(-d2 / (2 * sigma2));
}

/**
 * Get hue for a domain, with fallback to evenly-spaced unknown hues.
 */
let fallbackHueIndex = 0;
export function getDomainHue(domain: string): number {
  if (DOMAIN_HUES[domain] !== undefined) {
    return DOMAIN_HUES[domain];
  }
  const hue = FALLBACK_HUES[fallbackHueIndex % FALLBACK_HUES.length];
  fallbackHueIndex++;
  return hue;
}

/**
 * Compute blended color for a repo given its domains and the domain centroids.
 * This is the core AlphaXiv color blending algorithm adapted for multi-domain repos.
 */
export function computeBlendedColor(
  repoDomains: string[],
  domainCentroids: Map<string, { x: number; y: number }>,
  repoX: number,
  repoY: number,
  sigma2: number,
  isDark = false
): string {
  if (repoDomains.length === 0) {
    return hueToOklch(220, isDark); // neutral fallback
  }

  let cosSum = 0;
  let sinSum = 0;
  let totalWeight = 0;

  for (const domain of repoDomains) {
    const centroid = domainCentroids.get(domain);
    if (!centroid) continue;

    const dx = repoX - centroid.x;
    const dy = repoY - centroid.y;
    const d2 = dx * dx + dy * dy;
    const weight = gaussianWeight(d2, sigma2);

    if (weight < 0.001) continue; // negligible contribution

    const hue = getDomainHue(domain);
    const rad = (hue * Math.PI) / 180;
    cosSum += weight * Math.cos(rad);
    sinSum += weight * Math.sin(rad);
    totalWeight += weight;
  }

  // If no centroids matched (e.g., all weights too small), fall back to first domain hue
  if (totalWeight === 0 && repoDomains.length > 0) {
    return hueToOklch(getDomainHue(repoDomains[0]), isDark);
  }

  const blendedHue = hueFromVector(cosSum, sinSum);
  return hueToOklch(blendedHue, isDark);
}

/**
 * Precompute sigma2 = (0.13 * maxExtent)^2 matching AlphaXiv.
 * maxExtent is the max of span_x, span_y of all points.
 */
export function computeSigma2(
  points: { x: number; y: number }[],
  scale: number // WORLD scale factor
): number {
  if (points.length === 0) return 1;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const spanX = (maxX - minX) * scale;
  const spanY = (maxY - minY) * scale;
  const maxExtent = Math.max(spanX, spanY);
  const sigma = 0.13 * maxExtent;
  return sigma * sigma;
}

/**
 * Precompute domain centroid map from the domain_centroids array.
 */
export function buildDomainCentroidMap(
  domainCentroids: { domain: string; x: number; y: number }[]
): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  for (const dc of domainCentroids) {
    map.set(dc.domain, { x: dc.x, y: dc.y });
  }
  return map;
}