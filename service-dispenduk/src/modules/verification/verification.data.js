/**
 * Synthetic resident dataset for the Dukcapil stand-in.
 *
 * Every entry is invented data for demos and tests — never a real
 * person's record. All NIKs use the `99` province block, which does
 * not exist in Indonesia, so no entry can collide with a real NIK
 * while still satisfying the 16-digit format the consumer validates.
 * The dataset is intentionally tiny and fixed: verification must be
 * deterministic (same input → same response).
 */
const SYNTHETIC_RESIDENTS = Object.freeze([
  Object.freeze({ nik: '9901010101900001', name: 'Budi Santoso' }),
  Object.freeze({ nik: '9901014101900002', name: 'Siti Rahma' }),
  Object.freeze({ nik: '9901020202850003', name: 'Andi Wijaya' })
]);

module.exports = { SYNTHETIC_RESIDENTS };
