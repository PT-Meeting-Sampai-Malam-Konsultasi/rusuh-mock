const Boom = require('@hapi/boom');
const { validateVerify } = require('../validation/verification.validation');

/**
 * Creates controllers for the verification module.
 *
 * @param {object} useCase - Verification use case.
 * @returns {object} Verification controllers.
 */
function createVerificationController(useCase) {
  return {
    verify: (request, response, next) => {
      try {
        const result = useCase.verify(validateVerify(request.body));
        response.locals.skipResponseEnvelope = true;
        response.status(200).json({ data: result });
      } catch (error) {
        next(Boom.isBoom(error) ? error : Boom.badRequest(error.message));
      }
    }
  };
}

module.exports = { createVerificationController };
