const Joi = require('joi');

const createSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(500).allow('').default('')
});

const identifierSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required()
});

/**
 * Validates the request body used to create a sample resource.
 *
 * @param {unknown} payload - Request body.
 * @returns {object} Validated and normalized payload.
 * @throws {Error} When the request body is invalid.
 */
function validateCreate(payload) {
  const { error, value } = createSchema.validate(payload, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  return value;
}

/**
 * Validates the identifier route parameter.
 *
 * @param {unknown} parameters - Request route parameters.
 * @returns {object} Validated route parameters.
 * @throws {Error} When the identifier is invalid.
 */
function validateIdentifier(parameters) {
  const { error, value } = identifierSchema.validate(parameters, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  return value;
}

module.exports = { validateCreate, validateIdentifier };
