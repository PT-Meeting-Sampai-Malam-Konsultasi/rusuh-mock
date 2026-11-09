require('module-alias/register');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const defaultPlatform = require('@/platform/common');
const { parseCorsOrigins } = require('@/infrastructure/config/environment');
const { createDuplicateKeyVerifier } = require('@/presentation/http/middleware/duplicate-json-keys');
const { createResponseMiddleware } = require('@/presentation/http/middleware/response');
const { createErrorHandler } = require('@/presentation/http/middleware/error-handler');
const { notFound } = require('@/presentation/http/middleware/not-found');
const { createContainer } = require('@/container');

/**
 * Builds an Express application without binding a network port or starting jobs.
 *
 * @param {object} options - Application dependencies and runtime configuration.
 * @param {object} options.config - Validated service configuration.
 * @param {object} [options.platform] - Platform helper implementation.
 * @returns {import('express').Express} Configured Express application.
 */
function createApp({ config, platform = defaultPlatform } = {}) {
  if (!config) throw new Error('createApp requires validated configuration');

  const container = createContainer({ config, platform });
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins || parseCorsOrigins() }));
  app.use(createResponseMiddleware({ platform }));
  app.use(
    express.json({
      limit: config.bodyLimit,
      verify: createDuplicateKeyVerifier(config.enableDuplicateJsonKeyValidation)
    })
  );
  app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));

  app.use(container.healthRouter);
  app.use('/api/v1/verifications', container.verificationRouter);
  app.use(notFound);
  app.use(createErrorHandler({ platform }));

  return app;
}

module.exports = { createApp };
