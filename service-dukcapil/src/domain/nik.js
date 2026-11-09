const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// The single reason code surfaced for ANY format failure. The granular
// checks below still decide validity (16 digits, birth-date component,
// sequence), but they no longer surface as distinct codes: clients map
// this one code to one message.
const NIK_INVALID_FORMAT = 'NIK_INVALID_FORMAT';

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
 * @param {unknown} nik - Candidate NIK.
 * @returns {string|null} Null when the format is valid, otherwise
 * NIK_INVALID_FORMAT.
 */
function getNikFormatReason(nik) {
  if (typeof nik !== 'string' || !/^\d{16}$/.test(nik)) return NIK_INVALID_FORMAT;

  const month = Number(nik.slice(8, 10));
  let day = Number(nik.slice(6, 8));
  if (day > 40) day -= 40;
  if (month < 1 || month > 12 || day < 1 || day > DAYS_IN_MONTH[month - 1]) {
    return NIK_INVALID_FORMAT;
  }
  if (nik.slice(12, 16) === '0000') return NIK_INVALID_FORMAT;

  return null;
}

/**
 * Checks whether a NIK has a valid structural format.
 *
 * @param {unknown} nik - Candidate NIK.
 * @returns {boolean} Whether the NIK is structurally valid.
 */
function isValidNikFormat(nik) {
  return getNikFormatReason(nik) === null;
}

module.exports = { NIK_INVALID_FORMAT, getNikFormatReason, isValidNikFormat };
