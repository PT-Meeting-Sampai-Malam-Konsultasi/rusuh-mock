const defaultPlatform = require('@/platform/common');
const { createHealthService } = require('@/modules/health/health.service');
const { createHealthController } = require('@/modules/health/health.controller');
const { createHealthRouter } = require('@/modules/health/health.route');
const { createVerificationService } = require('@/modules/verification/verification.service');
const { createVerificationController } = require('@/modules/verification/verification.controller');
const { createVerificationRouter } = require('@/modules/verification/verification.route');

/**
 * Mounts service routers and returns the reusable module dependencies.
 *
 * @param {import('express').Express} app - Express application instance.
 * @param {object} options - Router dependencies and feature flags.
 * @param {object} [options.platform] - Platform helper implementation.
 * @param {boolean} [options.usePlatformPreHandler] - Whether to apply platform authentication middleware.
 * @param {Function} [options.isReady] - Optional readiness predicate.
 * @param {object[]} [options.verificationDataset] - Optional synthetic resident dataset for tests.
 * @returns {object} Mounted service modules.
 */
function mountRoutes(
  app,
  { platform = defaultPlatform, usePlatformPreHandler = false, isReady, verificationDataset } = {}
) {
  const healthService = createHealthService({ isReady });
  const healthController = createHealthController(healthService);
  const verificationService = createVerificationService(verificationDataset);
  const verificationController = createVerificationController(verificationService);
  const preHandler = usePlatformPreHandler ? platform.preHandler : undefined;

  app.use(createHealthRouter(healthController));
  app.use('/api/v1/verifications', createVerificationRouter(verificationController, preHandler));

  return { healthService, verificationService };
}

module.exports = { mountRoutes };
