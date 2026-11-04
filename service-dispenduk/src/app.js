require('module-alias/register');

const express = require('express');
const CommonHelper = require('module-common-function');
const { createDuplicateKeyVerifier } = require('@/middleware/duplicate-json-keys');
const { createResponseMiddleware } = require('@/middleware/response');
const { createErrorHandler } = require('@/middleware/error-handler');
const { notFound } = require('@/middleware/not-found');
const { mountRoutes } = require('@/routes');

/**
 * Builds an Express application without binding a network port or starting jobs.
 *
 * @param {object} options - Application dependencies and runtime configuration.
 * @param {object} options.config - Validated service configuration.
 * @param {object} [options.platform] - Platform helper implementation.
 * @param {boolean} [options.usePlatformPreHandler] - Whether example routes use platform authentication.
 * @param {Function} [options.isReady] - Optional readiness predicate.
 * @param {Map<string, object>} [options.sampleResourceStore] - Optional sample resource backing store.
 * @returns {import('express').Express} Configured Express application.
 */
function createApp({
  config,
  platform = CommonHelper,
  usePlatformPreHandler = false,
  isReady,
  sampleResourceStore
} = {}) {
  if (!config) throw new Error('createApp requires validated configuration');

  const app = express();
  app.disable('x-powered-by');
  app.use(createResponseMiddleware({ platform }));
  app.use(
    express.json({
      limit: config.bodyLimit,
      verify: createDuplicateKeyVerifier(config.enableDuplicateJsonKeyValidation)
    })
  );
  app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));

  mountRoutes(app, { platform, usePlatformPreHandler, isReady, sampleResourceStore });
  app.use(notFound);
  app.use(createErrorHandler({ platform }));

  return app;
}

module.exports = { createApp };
