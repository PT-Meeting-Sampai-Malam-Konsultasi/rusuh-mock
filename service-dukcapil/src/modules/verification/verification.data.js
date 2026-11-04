/**
 * Synthetic NIK dataset for the Dukcapil stand-in.
 *
 * Every entry is invented data for demos and tests — never a real
 * person's NIK. Entries use the real Indonesian NIK format (province
 * + regency/city + district + birth date + sequence, with valid
 * birth dates) so dummy data still looks authentic, as requested.
 * Because the format is real, an entry could in theory coincide
 * with a real person's NIK — the persons here are invented, and
 * everything in this repo is marked synthetic.
 * The dataset is intentionally tiny and fixed: verification must be
 * deterministic (same input → same response).
 */
const SYNTHETIC_RESIDENTS = Object.freeze([
  // Jakarta Pusat, male, born 1 Jan 1990, sequence 0001.
  '3171010101900001',
  // Jakarta Pusat, female, born 1 Jan 1990 (day + 40), sequence 0002.
  '3171014101900002',
  // Kota Bogor, male, born 2 Feb 1985, sequence 0003.
  '3271010202850003'
]);

module.exports = { SYNTHETIC_RESIDENTS };
