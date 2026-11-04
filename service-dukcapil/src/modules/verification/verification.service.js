const { VERIFICATION_REASONS } = require('./verification.constant');
const { SYNTHETIC_RESIDENTS } = require('./verification.data');

/**
 * Creates the deterministic in-memory NIK verification service.
 *
 * @param {string[]} [residents] - Synthetic NIK dataset (injectable for tests).
 * @returns {object} Verification operations.
 */
function createVerificationService(residents = SYNTHETIC_RESIDENTS) {
  const knownNiks = new Set(residents);

  return {
    /**
     * Verifies a NIK against the synthetic dataset.
     *
     * @param {object} input - Validated verification input.
     * @param {string} input.nik - 16-digit NIK to verify.
     * @returns {object} Verification result (unknown NIKs never throw).
     */
    verify({ nik }) {
      if (!knownNiks.has(nik)) {
        return { nik, valid: false, reason: VERIFICATION_REASONS.NIK_NOT_FOUND };
      }

      return { nik, valid: true, reason: null };
    }
  };
}

module.exports = { createVerificationService };
