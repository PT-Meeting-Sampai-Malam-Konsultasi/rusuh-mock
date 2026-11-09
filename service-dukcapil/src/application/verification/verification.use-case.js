const { verifyNik } = require('@/domain/verification');

/**
 * Creates the deterministic NIK verification use case. The dataset is
 * received by injection (the container supplies the synthetic
 * residents); the use case never imports infrastructure.
 *
 * @param {object} options - Use-case dependencies.
 * @param {string[]} options.residents - Synthetic NIK dataset.
 * @returns {object} Verification operations.
 */
function createVerificationUseCase({ residents } = {}) {
  if (!residents) throw new Error('createVerificationUseCase requires residents');
  const knownNiks = new Set(residents);

  return {
    /**
     * Verifies a NIK against the synthetic dataset.
     *
     * @param {object} input - Validated verification input.
     * @param {string} input.nik - 16-digit NIK to verify.
     * @returns {object} Verification result (unknown NIKs never throw).
     */
    verify: ({ nik }) => verifyNik(knownNiks, nik)
  };
}

module.exports = { createVerificationUseCase };
