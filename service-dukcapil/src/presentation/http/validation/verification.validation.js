const Joi = require('joi');
const { isValidNikFormat } = require('@/domain/nik');

const verifySchema = Joi.object({
  nik: Joi.string()
    .custom((value, helpers) => {
      if (!isValidNikFormat(value)) return helpers.error('nik.invalid');
      return value;
    })
    .required()
    .messages({
      'nik.invalid': '"nik" must be a valid Indonesian NIK (16 digits with a valid birth date component)'
    })
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
