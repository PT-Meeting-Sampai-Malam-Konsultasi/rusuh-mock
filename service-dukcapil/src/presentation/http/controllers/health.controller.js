/**
 * Creates controllers for operational service endpoints.
 *
 * @param {object} healthUseCase - Health use case.
 * @returns {object} Health endpoint controllers.
 */
function createHealthController(healthUseCase) {
  return {
    ping: (_request, response) => {
      response.locals.skipResponseEnvelope = true;
      response.type('text/plain').send('ok');
    },
    live: (_request, response) => {
      response.locals.skipResponseEnvelope = true;
      response.status(200).json(healthUseCase.live());
    },
    ready: (_request, response) => {
      response.locals.skipResponseEnvelope = true;
      response.status(200).json(healthUseCase.ready());
    }
  };
}

module.exports = { createHealthController };
