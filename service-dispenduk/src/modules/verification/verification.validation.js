const Joi = require('joi');

const verifySchema = Joi.object({
  nik: Joi.string()
    .pattern(/^\d{16}$/)
    .required()
    .messages({ 'string.pattern.base': '"nik" must be a 16-digit number' }),
  name: Joi.string().trim().min(1).max(100).required()
});

/**
 * Validates the request body used to verify a NIK.
 *
 * @param {unknown} payload - Request body.
 * @returns {object} Validated and normalized payload.
 * @throws {Error} When the request body is invalid.
 */
function validateVerify(payload) {
  const { error, value } = verifySchema.validate(payload, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  return value;
}

module.exports = { validateVerify };
