/**
 * Creates health operations for liveness and readiness endpoints.
 * Readiness is unconditional: the service has no external
 * dependencies to wait for, so it is ready once it can respond.
 *
 * @returns {object} Health operations.
 */
function createHealthUseCase() {
  return {
    live: () => ({ status: 'ok' }),
    ready: () => ({ status: 'ready' })
  };
}

module.exports = { createHealthUseCase };
