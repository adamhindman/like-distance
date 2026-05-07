import { haversineKm } from './geo.js';

let citiesPromise = null;

function loadCities() {
  if (!citiesPromise) {
    citiesPromise = fetch('/cities.json').then(r => r.json());
  }
  return citiesPromise;
}

function bearing(lat1, lng1, lat2, lng2) {
  const toRad = d => d * Math.PI / 180;
  const dLng = toRad(lng2 - lng1);
  const lat1r = toRad(lat1);
  const lat2r = toRad(lat2);
  const y = Math.sin(dLng) * Math.cos(lat2r);
  const x = Math.cos(lat1r) * Math.sin(lat2r) - Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

const DIRS = [
  { label: 'N',  arrow: '↑', center: 0   },
  { label: 'NE', arrow: '↗', center: 45  },
  { label: 'E',  arrow: '→', center: 90  },
  { label: 'SE', arrow: '↘', center: 135 },
  { label: 'S',  arrow: '↓', center: 180 },
  { label: 'SW', arrow: '↙', center: 225 },
  { label: 'W',  arrow: '←', center: 270 },
  { label: 'NW', arrow: '↖', center: 315 },
];

function getDir(b) {
  return DIRS.reduce((best, d) => {
    const diff = Math.min(Math.abs(b - d.center), 360 - Math.abs(b - d.center));
    const bestDiff = Math.min(Math.abs(b - best.center), 360 - Math.abs(b - best.center));
    return diff < bestDiff ? d : best;
  });
}

export function preloadCities() {
  loadCities();
}

export async function findPlaces(originLat, originLng, targetKm) {
  const cities = await loadCities();
  const lo = targetKm * 0.85;
  const hi = targetKm * 1.15;
  const byDir = {};

  for (const city of cities) {
    const dist = haversineKm(originLat, originLng, city.lat, city.lng);
    if (dist < lo || dist > hi) continue;
    const dir = getDir(bearing(originLat, originLng, city.lat, city.lng));
    if (!byDir[dir.label] || city.p > byDir[dir.label].p) {
      byDir[dir.label] = { ...city, dist, dir };
    }
  }

  return Object.values(byDir)
    .sort((a, b) => a.dist - b.dist)
    .map(c => ({
      name: c.n,
      country: c.c,
      arrow: c.dir.arrow,
      direction: c.dir.label,
      displayDist: `${Math.round(c.dist)} km (${Math.round(c.dist / 1.60934)} mi)`,
    }));
}
