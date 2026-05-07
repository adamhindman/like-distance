#!/usr/bin/env node
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TMP = '/tmp/geonames-process';
const OUT = join(ROOT, 'public/cities.json');
const MIN_POP = 50_000;

mkdirSync(TMP, { recursive: true });
mkdirSync(join(ROOT, 'public'), { recursive: true });

console.log('Downloading cities500.zip from GeoNames…');
execSync(`curl -sL "https://download.geonames.org/export/dump/cities500.zip" -o "${TMP}/cities500.zip"`);
execSync(`unzip -o "${TMP}/cities500.zip" -d "${TMP}"`);

console.log('Parsing and filtering (population ≥ 50,000)…');
const lines = readFileSync(join(TMP, 'cities500.txt'), 'utf8').split('\n');
const cities = [];

for (const line of lines) {
  if (!line.trim()) continue;
  const cols = line.split('\t');
  const pop = parseInt(cols[14], 10);
  if (isNaN(pop) || pop < MIN_POP) continue;
  cities.push({
    n: cols[1],              // name
    c: cols[8],              // ISO country code
    lat: parseFloat(cols[4]),
    lng: parseFloat(cols[5]),
    p: pop,
  });
}

writeFileSync(OUT, JSON.stringify(cities));
console.log(`Done — ${cities.length} cities written to public/cities.json`);
