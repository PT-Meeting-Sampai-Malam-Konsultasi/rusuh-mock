const { NIK_FORMAT_REASONS, getNikFormatReason } = require('@/domain/nik');

const VERIFICATION_REASONS = NIK_FORMAT_REASONS;

/**
 * Verifies a NIK by format only. Pure: no I/O, no state, no dataset
 * lookup. Format-invalid NIKs are a result, never an error.
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

module.exports = { VERIFICATION_REASONS, verifyNik };
