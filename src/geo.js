const EARTH_R = 6371; // km

export function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_R * 2 * Math.asin(Math.sqrt(a));
}

export const kmToMiles = km => km / 1.60934;
export const milesToKm = mi => mi * 1.60934;

export async function geocode(query) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: 1,
    email: 'adamhindman@gmail.com',
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) throw new Error('Geocoding request failed');
  const data = await res.json();
  if (!data.length) throw new Error(`Could not find "${query}"`);
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    name: data[0].display_name.split(',')[0].trim(),
  };
}
