const Boom = require('@hapi/boom');
const { validateCreate, validateIdentifier } = require('./sample-resource.validation');

/**
 * Creates controllers for the sample resource module.
 *
 * @param {object} service - Sample resource service.
 * @returns {object} Sample resource controllers.
 */
function createSampleResourceController(service) {
  return {
    create: (request, response, next) => {
      try {
        const resource = service.create(validateCreate(request.body));
        response.locals.skipResponseEnvelope = true;
        response.status(201).json({ data: resource });
      } catch (error) {
        next(Boom.isBoom(error) ? error : Boom.badRequest(error.message));
      }
    },
    list: (_request, response) => {
      response.locals.skipResponseEnvelope = true;
      response.status(200).json({ data: service.list() });
    },
    getById: (request, response, next) => {
      try {
        const { id } = validateIdentifier(request.params);
        response.locals.skipResponseEnvelope = true;
        response.status(200).json({ data: service.getById(id) });
      } catch (error) {
        next(Boom.isBoom(error) ? error : Boom.badRequest(error.message));
      }
    }
  };
}

module.exports = { createSampleResourceController };
