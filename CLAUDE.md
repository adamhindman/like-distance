# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Vite dev server (localhost:5173)
npm run build        # production build → dist/
npm run preview      # preview the production build locally
npm run process-cities  # re-download and regenerate public/cities.json from GeoNames
```

## Architecture

Pure client-side Vite + vanilla JS app. No backend. Deployed to Netlify as a static site (`netlify.toml` points build output to `dist/`). **No Netlify Functions.**

### Data flow

1. **Geocoding** — city name strings are resolved to `{lat, lng}` via the Nominatim (OpenStreetMap) API, called directly from the browser. Rate limit: 1 req/sec; each user action makes at most 2 concurrent calls.

2. **City dataset** — `public/cities.json` is a pre-generated static asset (~12k cities, population ≥ 50k) derived from GeoNames `cities500.txt`. It is loaded once on page load (`preloadCities()` fires immediately on import) and cached in memory. Shape: `{n: name, c: countryCode, lat, lng, p: population}`.

3. **Distance search** — `findPlaces()` in `src/search.js` iterates all 12k cities in-memory, filters to those within ±15% of the target distance, groups by 8 cardinal directions, and returns the highest-population city per direction. All math is Haversine.

### Module structure

| File | Responsibility |
|------|---------------|
| `src/geo.js` | `geocode()`, `haversineKm()`, `kmToMiles()`, `milesToKm()` |
| `src/search.js` | `preloadCities()`, `findPlaces()`, bearing + direction bucketing |
| `src/main.js` | DOM wiring, state (`activeDistKm`), calls into geo.js and search.js |
| `src/style.css` | All styles (single file, CSS custom properties) |
| `scripts/process-cities.js` | One-time Node script — downloads GeoNames zip, filters, writes `public/cities.json` |

### Key state

`activeDistKm` (in `main.js`) is the single piece of shared state — the distance in km set by either the two-city calculator or the manual input. Everything in Step 2 reads from it.

### Regenerating city data

Run `npm run process-cities` if you need to update the dataset (e.g., change the population threshold). The script downloads fresh data from GeoNames and overwrites `public/cities.json`. Commit the result — Netlify's build command is just `npm run build` and does not re-fetch.
