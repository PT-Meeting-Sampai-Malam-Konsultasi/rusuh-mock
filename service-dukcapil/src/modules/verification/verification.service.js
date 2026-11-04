const { VERIFICATION_REASONS } = require('./verification.constant');
const { SYNTHETIC_RESIDENTS } = require('./verification.data');

/**
 * Creates the deterministic in-memory NIK verification service.
 *
 * @param {object[]} [residents] - Synthetic resident dataset (injectable for tests).
 * @returns {object} Verification operations.
 */
function createVerificationService(residents = SYNTHETIC_RESIDENTS) {
  const byNik = new Map(residents.map((resident) => [resident.nik, resident]));

  return {
    /**
     * Verifies a NIK against a name from the synthetic dataset.
     *
     * @param {object} input - Validated verification input.
     * @param {string} input.nik - 16-digit NIK to verify.
     * @param {string} input.name - Name to match against the dataset.
     * @returns {object} Verification result (unknown NIKs never throw).
     */
    verify({ nik, name }) {
      const resident = byNik.get(nik);

      if (!resident) {
        return { nik, valid: false, name: null, reason: VERIFICATION_REASONS.NIK_NOT_FOUND };
      }

      if (resident.name.toLowerCase() !== name.trim().toLowerCase()) {
        return { nik, valid: false, name: null, reason: VERIFICATION_REASONS.NAME_MISMATCH };
      }

      return { nik, valid: true, name: resident.name, reason: null };
    }
  };
}

module.exports = { createVerificationService };
