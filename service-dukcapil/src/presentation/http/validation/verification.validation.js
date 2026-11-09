const Joi = require('joi');

// Only the request shape is validated here: nik must be a present,
// non-empty string. Format checking lives in the domain
// (getNikFormatReason) and returns a valid:false result, never a 400.
const verifySchema = Joi.object({
  nik: Joi.string().min(1).required()
});

/**
 * Validates the request body used to verify a NIK.
 *
 * @param {unknown} payload - Request body.
 * @returns {object} Validated and normalized payload.
 * @throws {Error} When the request body is malformed.
 */
function validateVerify(payload) {
  const { error, value } = verifySchema.validate(payload, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  return value;
}

module.exports = { validateVerify };
