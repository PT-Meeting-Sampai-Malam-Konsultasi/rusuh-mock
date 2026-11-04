const CommonHelper = require('module-common-function');
const { createHealthService } = require('@/modules/health/health.service');
const { createHealthController } = require('@/modules/health/health.controller');
const { createHealthRouter } = require('@/modules/health/health.route');
const { createSampleResourceService } = require('@/modules/sample-resource/sample-resource.service');
const { createSampleResourceController } = require('@/modules/sample-resource/sample-resource.controller');
const { createSampleResourceRouter } = require('@/modules/sample-resource/sample-resource.route');

/**
 * Mounts service routers and returns the reusable module dependencies.
 *
 * @param {import('express').Express} app - Express application instance.
 * @param {object} options - Router dependencies and feature flags.
 * @param {object} [options.platform] - Platform helper implementation.
 * @param {boolean} [options.usePlatformPreHandler] - Whether to apply platform authentication middleware.
 * @param {Function} [options.isReady] - Optional readiness predicate.
 * @param {Map<string, object>} [options.sampleResourceStore] - Optional sample resource test store.
 * @returns {object} Mounted service modules.
 */
function mountRoutes(
  app,
  { platform = CommonHelper, usePlatformPreHandler = false, isReady, sampleResourceStore } = {}
) {
  const healthService = createHealthService({ isReady });
  const healthController = createHealthController(healthService);
  const sampleResourceService = createSampleResourceService(sampleResourceStore);
  const sampleResourceController = createSampleResourceController(sampleResourceService);
  const preHandler = usePlatformPreHandler ? platform.preHandler : undefined;

  app.use(createHealthRouter(healthController));
  app.use('/api/v1/sample-resources', createSampleResourceRouter(sampleResourceController, preHandler));

  return { healthService, sampleResourceService };
}

module.exports = { mountRoutes };
