const VERIFICATION_REASONS = Object.freeze({
  NIK_NOT_FOUND: 'NIK_NOT_FOUND'
});

/**
 * Verifies a NIK against a known-NIK set. Pure: no I/O, no state.
 * Unknown NIKs are a result, never an error.
 *
 * @param {Set<string>} knownNiks - NIKs present in the dataset.
 * @param {string} nik - 16-digit NIK to verify.
 * @returns {object} Verification result.
 */
function verifyNik(knownNiks, nik) {
  if (!knownNiks.has(nik)) {
    return { nik, valid: false, reason: VERIFICATION_REASONS.NIK_NOT_FOUND };
  }

  return { nik, valid: true, reason: null };
}

module.exports = { VERIFICATION_REASONS, verifyNik };
