const { verifyNik } = require('@/domain/verification');

// Fixtures for the readiness self-test: one format-valid NIK and one
// format-invalid NIK. These are format examples, not a dataset lookup.
const SELF_TEST_VALID_NIK = '3171010101900001';
const SELF_TEST_INVALID_NIK = '3171010113900001';

/**
 * Default readiness check: a functional self-test of the service's
 * core function. This service is stateless with no downstream
 * dependency, so "ready" means its verification logic is loaded and
 * behaving correctly: the format validator must accept a known-valid
 * NIK and reject a known-invalid one. A dead process answers nothing
 * at all (the load balancer sees connection-refused), so this
 * endpoint's job is to distinguish "up and able to serve" from
 * "up but broken".
 *
 * @returns {Promise<boolean>} Whether the self-test passed.
 */
async function selfTestReadiness() {
  return verifyNik(SELF_TEST_VALID_NIK).valid === true && verifyNik(SELF_TEST_INVALID_NIK).valid === false;
}

/**
 * Creates health operations for liveness and readiness endpoints.
 *
 * @param {object} [options] - Health dependencies.
 * @param {Function} [options.isReady] - Optional asynchronous readiness
 *   predicate (defaults to the verification self-test).
 * @returns {object} Health operations.
 */
function createHealthUseCase({ isReady = selfTestReadiness } = {}) {
  return {
    live: () => ({ status: 'ok' }),
    ready: async () => ({ status: (await isReady()) ? 'ready' : 'not_ready' })
  };
}

module.exports = { createHealthUseCase };
