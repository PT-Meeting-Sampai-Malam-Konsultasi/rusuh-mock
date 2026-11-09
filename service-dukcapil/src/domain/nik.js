const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Checks the structural format of an Indonesian NIK (16 digits):
 * province (2) + regency/city (2) + district (2) + birth date (6:
 * DDMMYY, day + 40 for females) + sequence (4).
 *
 * Region codes are NOT checked against the Kemendagri table (that
 * needs the full region registry); the date component IS checked
 * (month 01-12, day valid for the month, female offset 41-71) and
 * sequence 0000 is rejected (sequences start at 0001).
 *
 * @param {string} nik - Candidate NIK.
 * @returns {boolean} Whether the NIK is structurally valid.
 */
function isValidNikFormat(nik) {
  if (!/^\d{16}$/.test(nik)) return false;

  const month = Number(nik.slice(8, 10));
  let day = Number(nik.slice(6, 8));
  if (day > 40) day -= 40;
  if (month < 1 || month > 12 || day < 1 || day > DAYS_IN_MONTH[month - 1]) return false;
  if (nik.slice(12, 16) === '0000') return false;

  return true;
}

module.exports = { isValidNikFormat };
