const { verifyNik } = require('@/domain/verification');

/**
 * Creates the deterministic NIK verification use case. Verification
 * is format-only: no dataset, no file lookup, no I/O.
 *
 * @returns {object} Verification operations.
 */
function createVerificationUseCase() {
  return {
    /**
     * Verifies a NIK by format only.
     *
     * @param {object} input - Validated verification input.
     * @param {string} input.nik - NIK to verify.
     * @returns {object} Verification result (format-invalid NIKs never throw).
     */
    verify: ({ nik }) => verifyNik(nik)
  };
}

module.exports = { createVerificationUseCase };
