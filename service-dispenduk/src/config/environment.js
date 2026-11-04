const Joi = require('joi');

const environmentSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
  PORT: Joi.number().port().default(8080),
  BODY_LIMIT: Joi.string().default('100kb'),
  ENABLE_DUPLICATE_JSON_KEY_VALIDATION: Joi.boolean().truthy('true').falsy('false').default(false),
  HTTP_TIMEOUT_MS: Joi.number().integer().positive().default(10000),
  CACHE_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
  CACHE_MAX_ENTRIES: Joi.number().integer().positive().default(500),
  CACHE_TTL_MS: Joi.number().integer().positive().default(900000),
  CONFIG_DB_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
  CONFIG_DB_REFRESH_INTERVAL_MS: Joi.number().integer().positive().allow(null, '').default(null),
  GRACEFUL_SHUTDOWN_TIMEOUT_MS: Joi.number().integer().positive().default(10000)
}).unknown(false);

/**
 * Validates process environment and returns the service runtime configuration.
 *
 * @param {NodeJS.ProcessEnv} environment - Source environment variables.
 * @returns {object} Validated runtime configuration.
 * @throws {Error} When an environment value is invalid or unexpected.
 */
function loadEnvironment(environment = process.env) {
  const { error, value } = environmentSchema.validate(environment, {
    abortEarly: false,
    convert: true,
    stripUnknown: true
  });

  if (error) {
    throw new Error(`Invalid environment configuration: ${error.details.map((detail) => detail.message).join(', ')}`);
  }

  return {
    nodeEnv: value.NODE_ENV,
    port: value.PORT,
    bodyLimit: value.BODY_LIMIT,
    enableDuplicateJsonKeyValidation: value.ENABLE_DUPLICATE_JSON_KEY_VALIDATION,
    httpTimeoutMs: value.HTTP_TIMEOUT_MS,
    cache: {
      enabled: value.CACHE_ENABLED,
      maxEntries: value.CACHE_MAX_ENTRIES,
      ttlMs: value.CACHE_TTL_MS
    },
    configDb: {
      enabled: value.CONFIG_DB_ENABLED,
      refreshIntervalMs: value.CONFIG_DB_REFRESH_INTERVAL_MS || null
    },
    gracefulShutdownTimeoutMs: value.GRACEFUL_SHUTDOWN_TIMEOUT_MS
  };
}

module.exports = { loadEnvironment };
