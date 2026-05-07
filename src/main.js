import { geocode, haversineKm, kmToMiles, milesToKm } from './geo.js';
import { findPlaces, preloadCities } from './search.js';

preloadCities();

const CITIES = [
  'Tokyo', 'Lagos', 'Cairo', 'Mumbai', 'São Paulo', 'Mexico City', 'Dhaka',
  'Istanbul', 'Karachi', 'Buenos Aires', 'Kinshasa', 'Manila', 'Lahore',
  'Rio de Janeiro', 'Tianjin', 'Guangzhou', 'Moscow', 'Bogotá', 'Jakarta', 'Nairobi',
];

function randomPair() {
  const i = Math.floor(Math.random() * CITIES.length);
  let j = Math.floor(Math.random() * (CITIES.length - 1));
  if (j >= i) j++;
  return [CITIES[i], CITIES[j]];
}

const $ = id => document.getElementById(id);

const cityA        = $('city-a');
const cityB        = $('city-b');
const calcBtn      = $('calc-btn');
const calcError    = $('calc-error');
const manualDist   = $('manual-dist');
const unitSelect   = $('unit-select');
const distBadge    = $('distance-badge');
const originInput  = $('origin-input');
const findBtn      = $('find-btn');
const findError    = $('find-error');
const resultsSection = $('results-section');
const resultsLabel = $('results-label');
const resultsList  = $('results-list');

const [pairA, pairB] = randomPair();
cityA.placeholder = pairA;
cityB.placeholder = pairB;

let activeDistKm = null;

function setDist(km) {
  activeDistKm = km;
  distBadge.textContent = `${Math.round(km)} km  (${Math.round(kmToMiles(km))} mi)`;
  distBadge.classList.remove('hidden');
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

calcBtn.addEventListener('click', async () => {
  if (!cityA.value.trim() || !cityB.value.trim()) return;
  calcError.classList.add('hidden');
  calcBtn.textContent = '…';
  calcBtn.disabled = true;
  try {
    const [a, b] = await Promise.all([geocode(cityA.value), geocode(cityB.value)]);
    manualDist.value = '';
    setDist(haversineKm(a.lat, a.lng, b.lat, b.lng));
  } catch (e) {
    showError(calcError, e.message);
  } finally {
    calcBtn.textContent = 'Calculate';
    calcBtn.disabled = false;
  }
});

manualDist.addEventListener('input', () => {
  const v = parseFloat(manualDist.value);
  if (!v || v <= 0) return;
  setDist(unitSelect.value === 'miles' ? milesToKm(v) : v);
});

unitSelect.addEventListener('change', () => {
  const v = parseFloat(manualDist.value);
  if (!v || v <= 0) return;
  setDist(unitSelect.value === 'miles' ? milesToKm(v) : v);
});

findBtn.addEventListener('click', async () => {
  findError.classList.add('hidden');
  if (!activeDistKm) {
    showError(findError, 'Set a distance in Step 1 first.');
    return;
  }
  if (!originInput.value.trim()) {
    showError(findError, 'Enter an origin city.');
    return;
  }
  findBtn.textContent = '…';
  findBtn.disabled = true;
  try {
    const origin = await geocode(originInput.value);
    const results = await findPlaces(origin.lat, origin.lng, activeDistKm);
    const label = unitSelect.value === 'miles'
      ? `${Math.round(kmToMiles(activeDistKm))} miles`
      : `${Math.round(activeDistKm)} km`;
    resultsLabel.textContent = `~${label} from ${origin.name}`;
    resultsList.innerHTML = results.length
      ? results.map(r => `
          <li>
            <span class="direction">${r.arrow}</span>
            <span class="place-name">${r.name}, ${r.country}</span>
            <span class="place-dist">${r.displayDist}</span>
          </li>`).join('')
      : '<li style="color:var(--muted)">No well-known places found at this distance.</li>';
    resultsSection.classList.remove('hidden');
  } catch (e) {
    showError(findError, e.message);
  } finally {
    findBtn.textContent = 'Find places';
    findBtn.disabled = false;
  }
});
