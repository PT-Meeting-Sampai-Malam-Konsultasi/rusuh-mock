const Joi = require('joi');

const DEFAULT_CORS_ORIGINS = Object.freeze([
  'https://rusuh-tiket.web.id',
  'https://www.rusuh-tiket.web.id',
  'http://localhost:3000',
  'http://localhost:5173'
]);

/**
 * Parses a comma-separated CORS origins string. Unset, empty, or
 * all-blank values fall back to the default origins.
 *
 * @param {string} [value] - Raw CORS_ORIGINS value.
 * @returns {string[]} Allowed origins.
 */
function parseCorsOrigins(value) {
  if (!value) return [...DEFAULT_CORS_ORIGINS];
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : [...DEFAULT_CORS_ORIGINS];
}

const environmentSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
  PORT: Joi.number().port().default(8080),
  BODY_LIMIT: Joi.string().default('100kb'),
  CORS_ORIGINS: Joi.string().allow('').optional(),
  ENABLE_DUPLICATE_JSON_KEY_VALIDATION: Joi.boolean().truthy('true').falsy('false').default(false),
  GRACEFUL_SHUTDOWN_TIMEOUT_MS: Joi.number().integer().positive().default(10000)
}).unknown(true);

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
    corsOrigins: parseCorsOrigins(value.CORS_ORIGINS),
    enableDuplicateJsonKeyValidation: value.ENABLE_DUPLICATE_JSON_KEY_VALIDATION,
    gracefulShutdownTimeoutMs: value.GRACEFUL_SHUTDOWN_TIMEOUT_MS
  };
}

module.exports = { loadEnvironment, parseCorsOrigins, DEFAULT_CORS_ORIGINS };
