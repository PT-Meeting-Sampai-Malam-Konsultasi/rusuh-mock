const defaultPlatform = require('@/platform/common');
const { SYNTHETIC_RESIDENTS } = require('@/infrastructure/data/synthetic-residents');
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
 * @param {boolean} [options.usePlatformPreHandler] - Whether routes use platform authentication.
 * @param {Function} [options.isReady] - Optional readiness predicate.
 * @param {object[]} [options.verificationDataset] - Optional synthetic resident dataset for tests.
 * @returns {object} Wired routers and use cases.
 */
function createContainer({
  config,
  platform = defaultPlatform,
  usePlatformPreHandler = false,
  isReady,
  verificationDataset
} = {}) {
  const healthUseCase = createHealthUseCase({ isReady });
  const verificationUseCase = createVerificationUseCase({
    residents: verificationDataset || SYNTHETIC_RESIDENTS
  });
  const healthController = createHealthController(healthUseCase);
  const verificationController = createVerificationController(verificationUseCase);
  const preHandler = usePlatformPreHandler ? platform.preHandler : undefined;

  return {
    config,
    platform,
    healthUseCase,
    verificationUseCase,
    healthRouter: createHealthRouter(healthController),
    verificationRouter: createVerificationRouter(verificationController, preHandler)
  };
}

module.exports = { createContainer };
