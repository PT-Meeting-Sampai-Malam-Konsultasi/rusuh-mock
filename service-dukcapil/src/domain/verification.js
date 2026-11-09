const { getNikFormatReason } = require('@/domain/nik');

/**
 * Verifies a NIK by format only. Pure: no I/O, no state, no dataset
 * lookup. Format-invalid NIKs are a result, never an error. Any format
 * failure surfaces the single reason code NIK_INVALID_FORMAT.
 *
 * @param {string} nik - NIK to verify.
 * @returns {object} Verification result.
 */
function verifyNik(nik) {
  const reason = getNikFormatReason(nik);
  if (reason) {
    return { nik, valid: false, reason };
  }

  return { nik, valid: true, reason: null };
}

module.exports = { verifyNik };
