const Boom = require('@hapi/boom');
const { validateVerify } = require('./verification.validation');

/**
 * Creates controllers for the verification module.
 *
 * @param {object} service - Verification service.
 * @returns {object} Verification controllers.
 */
function createVerificationController(service) {
  return {
    verify: (request, response, next) => {
      try {
        const result = service.verify(validateVerify(request.body));
        response.locals.skipResponseEnvelope = true;
        response.status(200).json({ data: result });
      } catch (error) {
        next(Boom.isBoom(error) ? error : Boom.badRequest(error.message));
      }
    }
  };
}

module.exports = { createVerificationController };
