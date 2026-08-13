# AlphaXiv Researcher Map — Reverse-Engineering Report

## 1. Reference Architecture

**Map Entry Point**: `/researchers/map` route (React SPA, module `map-CUr2xV3D.js`)
- Single-page canvas-based visualization, no SVG or WebGL
- Component `E` (exported as `component`) mounts the map
- Data fetched via `useQuery` from `/researchers/v1/map` endpoint

**Data Flow**:
```
REFERENCE DATA (/researchers/v1/map) 
  → PROCESSING (color blending, spatial hashing, centroid bounds)
  → MAP STATE (points + topic tiers + keywords + search index)
  → RENDERING (canvas 2d with requestAnimationFrame loop)
  → USER INTERACTION (pan/zoom/hover/click/search)
```

---

## 2. Map Data Model

### 2.1 Point/Node Structure (`e.points`)
Each researcher is a **point** with:
```javascript
{
  s: string,        // slug (unique ID)
  n: string,        // name
  a: string,        // affiliation
  h: string,        // headline/bio
  ph: string,       // photo URL
  ci: number,       // citations
  hi: number,       // h-index
  ra: string[],     // research areas
  x: number,        // map X [-1, 1]
  y: number,        // map Y [-1, 1]
  r: number,        // radius/size (visual weight)
  c: number,        // cluster/topic index (0..K-1)
  k: number[],      // keyword indices
}
```

### 2.2 Cluster/Topic Representation (`e.topicTiers`)
Three tiers of topic granularity (only tier 0 used in current map):
```javascript
e.topicTiers = [
  [  // Tier 0 — top-level fields (e.g., "Machine Learning", "Computer Vision")
    { label: "Machine Learning (1,234)", x: -0.2, y: 0.3, count: 1234 },
    { label: "Computer Vision (987)", x: 0.4, y: -0.1, count: 987 },
    ...
  ],
  [],  // Tier 1 — subfields (empty in current data)
  []   // Tier 2 — fine-grained (empty)
]
```

### 2.3 Keywords (`e.keywords`)
Flat list of research area keywords for search filtering:
```javascript
e.keywords = ["deep learning", "transformer", "computer vision", "nlp", ...]
```
Each point has `k: number[]` indices into this array.

---

## 3. Coordinate/Layout Model

- **Input coordinates**: Normalized to `[-1, 1] × [-1, 1]` from backend
- **World transform**: Viewport `p` (zoom), `g` (center X), `_` (center Y)
- **Screen transform**: `T(e, t) = [(e - g) * p + v/2, (t - _) * p + y/2]`
- **Inverse**: `A(e, t) = [(e - v/2) / p + g, (t - y/2) / p + _]`
- **Device pixel ratio**: Capped at 2× for performance (`b = min(dpr, 2)`)
- **Canvas size**: `v = width * b`, `y = height * b`

**Fit-to-content** (`de` function):
- Computes bounding box of ALL points
- Centers on `(minX+maxX)/2, (minY+maxY)/2`
- Scales so content fills ~82% of viewport: `h = min(W/dx, H/dy) * 0.82`

---

## 4. Cluster/Topic Model

### 4.1 Centroid Calculation
For each topic in tier 0:
```javascript
centroids = topicTiers[0].map(t => [t.x, t.y])  // already computed by backend
```

### 4.2 Color Generation — **Blended Gaussian Weights**
This is the **key innovation**: points near multiple topic centroids get blended colors.

```javascript
// Precompute per-topic hue (evenly spaced around color wheel)
a = centroids.map((e, i) => ({ i, a: atan2(e[1]-cy, e[0]-cx) }))
           .sort((a,b) => a.a - b.a)
           .forEach((e,i) => f[e.i] = (25 + 360*i/o) % 360)

// Per-point color: weighted sum of topic hues
for each point:
  s = 0, c = 0
  for each topic centroid r:
    d2 = (point.x - centroid[r].x)^2 + (point.y - centroid[r].y)^2
    weight = exp(-d2 / (2 * sigma2))  // Gaussian kernel
    s += weight * cos(hue[r])
    c += weight * sin(hue[r])
  final_hue = atan2(c, s) * 180/PI
  color = oklch(L=0.6/0.72, C=0.135/0.15, final_hue)
```

**Parameters**:
- `sigma2 = (0.13 * max(span_x, span_y))^2` — bandwidth ~13% of map extent
- Lightness: `0.72` (light mode) / `0.6` (dark mode)
- Chroma: `0.15` (light) / `0.135` (dark)
- Fallback: CSS `--color-muted` / `--color-text`

**Result**: Smooth color transitions between topic regions, no hard boundaries.

---

## 5. Rendering Pipeline

### 5.1 Canvas 2D Context (not SVG, not WebGL)
- Single `<canvas>` element, full viewport
- `requestAnimationFrame` loop at ~30fps (33ms frame budget)
- Double-buffered via `globalAlpha` and layering order

### 5.2 Render Layers (back to front)
1. **Points** — two passes when searching:
   - Pass 0: non-matching points at low opacity (0.06) and scale (0.8)
   - Pass 1: matching points at high opacity (0.92) and full scale (1.0)
   - No search: single pass at opacity 0.82
2. **Selected point ring** — white stroke around hovered/clicked point
3. **Topic labels** — rendered per tier, sorted by tier weight
4. **Photos** — clipped circular images inside point circles (lazy-loaded, cached)

### 5.3 Point Rendering (`ne` function)
```javascript
r = (x-g)*p + v/2, i = (y-_)*p + y/2
if off-screen (cull): return
a = max(0.8, point.r * p * 0.82) * scale_factor
globalAlpha = opacity
fillStyle = point.color
arc(r, i, a, 0, 2PI), fill()

// Photo overlay (if point has photo && opacity > 0.5)
img = get_cached_image(point.ph)
if img.ready:
  globalAlpha *= fade_in_factor
  clip to circle, drawImage centered, stroke ring
```

### 5.4 Label Rendering (`le` function)
- **Tier weight**: `w = max(0, 1 - |tier - ideal_tier| / log(4.5))`
- Tiers sorted by weight descending
- Font sizes: `[21, 16.5, 14]px` per tier
- **Collision avoidance**: O(N²) check against already-placed label boxes
- Shadow: double-stroke (dark thick + white thin) for legibility on dots

### 5.5 Level of Detail (LOD) in Zoom Handler
```javascript
onZoom:
  glowG.opacity = k < 0.35 ? 0.9 : 1      // glows visible when zoomed out
  dotG.opacity  = k < 0.35 ? 0.4 : 1      // dots fade when zoomed out
  labelG.opacity = k < 0.42 ? 0 : 1       // labels only when zoomed in
```

---

## 6. Spatial Indexing Strategy

### 6.1 Uniform Grid (Spatial Hash)
```javascript
l = max(max_point_r * 18, 0.05)  // cell size ~18x max point radius
key = `${floor(x/l)},${floor(y/l)}`
grid = Map<key, point_indices[]>
```
- Built once per render frame (after layout computation)
- Cell size scales with max point radius
- Used for: **hover hit-testing**, **search filtering**

### 6.2 Hit-Testing (`fe` function)
```javascript
fe(screen_x, screen_y):
  [world_x, world_y] = A(screen_x, screen_y)
  search_radius = max_point_r * 0.82 + 6/p
  for cells in grid within search_radius:
    for point in cell:
      if (point.x - world_x)^2 + (point.y - world_y)^2 <= search_radius^2:
        return closest point
```
- O(1) average case (constant cells checked)
- Exact distance check within cell

---

## 7. Interaction Model

### 7.1 Pan (Drag)
- `mousedown` → `Y=true`, record start `Z,Q`
- `mousemove` → `g -= dx/p`, `_ -= dy/p`, request redraw
- `mouseup` → `Y=false`, cursor `grab`

### 7.2 Zoom (Wheel)
- `wheel` → `p *= exp(-deltaY * 0.0022)`, clamped `[h, 1200]`
- Zoom **toward cursor**: adjust `g,_` so cursor point stays fixed
- `requestAnimationFrame` for smooth frame

### 7.3 Hover
- `mousemove` (not dragging) → `fe(clientX, clientY)` → nearest point
- If found: show tooltip at cursor, enlarge point, highlight
- `mouseleave` → clear hover

### 7.4 Click/Select
- `click` (not drag) → `fe` → if point: navigate to `/@/{slug}`

### 7.5 Search/Filter
- Text input → debounced filter on `point.haystack` (name + affiliation + headline)
- Keyword filter: `point.k` intersects search keyword set
- **Visual**: two-pass render (dimmed non-matches + bright matches)
- **Stats**: shows "N of M researchers"

### 7.6 Topic Navigation (Sidebar)
- Click topic in sidebar → animate camera to topic bounds (`E.current(t)`)
- Computes topic bbox from member points, fits with 25% padding
- 600ms ease-in-out animation

---

## 8. Filtering/Search Behavior

| Filter Type | Implementation |
|-------------|----------------|
| Text search | Substring match on `haystack` (name\|affiliation\|headline) |
| Keyword filter | `point.k` ∩ `search_keywords` ≠ ∅ |
| Topic click | Camera fly-to + highlight (no data filtering) |

**Search UX**: Input at bottom center, live filtering, result count badge.

---

## 9. Performance Techniques

| Technique | Implementation |
|-----------|----------------|
| Viewport culling | Skip points with `r < -20 || r > v+20 || i < -20 || i > y+20` |
| Spatial hash | O(1) hover hit-test, built per frame |
| Image cache | LRU cache (max 24 loading, size = points + 100) with `performance.now()` timestamps |
| Frame budget | `requestAnimationFrame` with 33ms deadline, drops frames if exceeded |
| Device pixel ratio | Capped at 2× |
| Reduced motion | Respects `prefers-reduced-motion` (instant transitions) |
| Lazy photo load | `Image.decode=async`, only when point hovered at high opacity |
| Label collision | O(N²) but N = labels per tier (~10-50), runs once per frame |

---

## 10. Important Algorithms/Functions

| Function | Purpose | Location |
|----------|---------|----------|
| `k` (useMemo) | Color system precompute (hues, centroids, sigma2) | Line 154-189 |
| `j` (useMemo) | Per-point blended color + haystack | Line 191-216 |
| `de` | Fit-to-content (bbox + scale) | Line 420-427 |
| `fe` | Spatial hash hit-test | Line 428-439 |
| `ne` | Point render (with photo) | Line 313-327 |
| `le` | Label render with collision avoidance | Line 347-382 |
| `ue` | Main render loop | Line 383-398 |
| `W`/`U`/`G` | RAF loop with frame budget | Line 399-413 |
| `pe` | Smooth camera animation (cubic easing) | Line 441-449 |
| `E.current` | Topic fly-to (sidebar click) | Line 450-457 |

---

## 11. Reusable Behaviors for GitMaps

✅ **Blended multi-domain colors** — GitMaps repos have multiple domains; Gaussian blending maps perfectly
✅ **Canvas rendering** — Scales to 100k+ points; current SVG hits limits ~5k
✅ **Spatial hash hover** — O(1) hit-test essential for large datasets
✅ **Level-of-detail (glows at low zoom)** — Continents readable at all scales
✅ **Label collision avoidance** — Cluster labels must not overlap
✅ **Smooth camera animation** — Fly-to cluster on sidebar click
✅ **Two-pass search render** — Dim non-matches, highlight matches
✅ **Viewport culling** — Don't draw off-screen points
✅ **Device pixel ratio cap** — Perf win on retina displays
✅ **Reduced motion support** — Accessibility

---

## 12. Incompatible Behaviors

❌ **Single-topic-per-point** — AlphaXiv: each researcher has ONE primary topic (`c` index). GitMaps: repos have MULTIPLE domains. **Solution**: Blend colors from ALL domain centroids using same Gaussian kernel.

❌ **Researcher-centric data** — AlphaXiv maps researchers. GitMaps maps repositories. **Solution**: Map repo → domains → domain centroids (already computed by layout.py).

❌ **Three topic tiers** — Only tier 0 used. GitMaps has single-level domains. **Solution**: Use domain centroids directly.

❌ **Photo avatars** — Researchers have photos. Repos don't. **Solution**: Skip photo rendering; use domain color dots.

❌ **Keyword search on research areas** — AlphaXiv has `ra` array. GitMaps has `topics` + `domains`. **Solution**: Search on `full_name`, `description`, `topics`, `domains`.

---

## 13. AlphaXiv → GitMaps Concept Mapping

| AlphaXiv Concept | GitMaps Equivalent | Notes |
|------------------|-------------------|-------|
| Researcher (point) | Repository (point) | 1:1 |
| Research area / topic | Technology domain | GitMaps: AI, Frontend, DevOps, etc. |
| Topic centroid (tier 0) | Domain centroid | Computed by layout.py as mean of member embeddings |
| `point.c` (single topic index) | `point.domains[]` (multi-domain) | **Key difference** — blend all domain colors |
| `point.k` (keyword indices) | `point.topics` + `point.domains` | Search on both |
| `point.haystack` (name+affil+headline) | `full_name + description + topics + domains` | |
| Topic sidebar (click → fly-to) | Domain sidebar (click → fly-to) | Same UX |
| Cluster label (topic name) | Domain label (domain name) | Position at domain centroid |
| Photo avatar | N/A | Skip |
| Citations / h-index | Stars / forks / momentum | Tooltip data |

### Color Blending Adaptation for Multi-Domain

AlphaXiv: `weight = exp(-dist^2 / (2*sigma^2))` from point to each **topic centroid**

GitMaps: Same formula, but sum over **all domain centroids** the repo belongs to:
```javascript
for each domain in repo.domains:
  centroid = domain_centroids[domain]
  d2 = distance^2(point, centroid)
  weight = exp(-d2 / (2 * sigma2))
  accumulate hue vector
final_color = oklch(L, C, atan2(sin_sum, cos_sum))
```

This naturally handles:
- Single-domain repos → pure domain color
- Multi-domain repos → smooth blend between domain colors
- Repos between domains → gradient transition zones

---

## 14. Implementation Requirements for GitMaps

### Backend (Already Exists)
- `/map` endpoint returns `clusters[]` (domain centroids) + `repos[]` (positions + domains)
- `layout.py` computes domain centroids via MDS + member offsets via PCA
- Need: Add `domain_centroids` to `/map` response (or compute from clusters)

### Frontend (To Implement)
1. **Replace SVG MapView with Canvas MapView**
   - Single `<canvas>` + `requestAnimationFrame` loop
   - Spatial hash for hover
   - Blended color computation (memoized)
   - Viewport culling
   - LOD (glows fade at low zoom)

2. **Domain Sidebar** (extend FilterPanel)
   - List domains with colors + counts
   - Click → animate to domain bounds

3. **Search on Map** (not view switch)
   - Search input on map (bottom center)
   - Filter points in-place, two-pass render
   - Result count badge

4. **Label System**
   - Domain labels at centroids
   - Collision avoidance
   - Scale with zoom (hide when zoomed out)

5. **Interactions**
   - Pan (drag), Zoom (wheel toward cursor)
   - Hover → tooltip + enlarge
   - Click → open RepoDetailPanel

6. **Performance**
   - Frame budget (33ms)
   - DPR capped at 2
   - Reduced motion support
   - Image cache not needed (no photos)

---

## 15. Files to Modify/Create

### New Files
- `frontend/src/components/MapViewCanvas.tsx` — New canvas-based map
- `frontend/src/hooks/useMapEngine.ts` — Render loop, spatial hash, color blending
- `frontend/src/utils/mapColors.ts` — OKLCH color blending utilities

### Modified Files
- `frontend/src/components/MapView.tsx` → **Replace** with canvas version
- `frontend/src/components/FilterPanel.tsx` → Add domain sidebar with fly-to
- `frontend/src/app/page.tsx` → Integrate search on map, pass domain centroids
- `gitmaps/api/routes/map.py` → Add `domain_centroids` to response
- `gitmaps/layout.py` → Ensure domain centroids are exposed

---

## 16. Validation Checklist

- [ ] Canvas renders 10k+ points at 60fps (idle), 30fps (interacting)
- [ ] Hover hit-test < 5ms (spatial hash)
- [ ] Multi-domain repos show blended colors
- [ ] Domain sidebar click → smooth 600ms fly-to
- [ ] Search filters in-place, shows "N of M" badge
- [ ] Labels don't overlap, hide at low zoom
- [ ] Zoom toward cursor works
- [ ] Pan/drag works
- [ ] Reduced motion respected
- [ ] TypeScript passes, mypy passes
- [ ] Backend tests pass
- [ ] Real GitMaps data renders correctly