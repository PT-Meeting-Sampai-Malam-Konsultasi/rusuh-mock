const defaultPlatform = require('@/platform/common');
const { createHealthUseCase } = require('@/application/health/health.use-case');
const { createVerificationUseCase } = require('@/application/verification/verification.use-case');
const { createHealthController } = require('@/presentation/http/controllers/health.controller');
const { createVerificationController } = require('@/presentation/http/controllers/verification.controller');
const { createHealthRouter } = require('@/presentation/http/routes/health.route');
const { createVerificationRouter } = require('@/presentation/http/routes/verification.route');

/**
 * Composition root: the only place that imports from every layer to
 * wire use cases, controllers, and routers together.
 *
 * @param {object} options - Container dependencies and runtime configuration.
 * @param {object} options.config - Validated service configuration.
 * @param {object} [options.platform] - Platform helper implementation.
 * @returns {object} Wired routers and use cases.
 */
function createContainer({ config, platform = defaultPlatform } = {}) {
  const healthUseCase = createHealthUseCase();
  const verificationUseCase = createVerificationUseCase();
  const healthController = createHealthController(healthUseCase);
  const verificationController = createVerificationController(verificationUseCase);

  return {
    config,
    platform,
    healthUseCase,
    verificationUseCase,
    healthRouter: createHealthRouter(healthController),
    verificationRouter: createVerificationRouter(verificationController)
  };
}

module.exports = { createContainer };
