# Like Distance

**https://like-distance.netlify.app**

Enter two cities to get the straight-line distance between them, then find well-known places that are roughly the same distance from anywhere in the world.

## How it works

1. **Set a distance** — calculate the straight-line distance between two cities, or enter one directly
2. **Find places** — enter an origin city to see well-known places at roughly that distance, grouped by direction

## Stack

- Vanilla JS + Vite
- [Nominatim](https://nominatim.openstreetmap.org/) for geocoding
- [GeoNames](https://www.geonames.org/) city dataset (bundled, ~12k cities with population ≥ 50k)
- Hosted on Netlify

## Development

```bash
npm install
npm run dev
```

To regenerate the city dataset:

```bash
npm run process-cities
```
