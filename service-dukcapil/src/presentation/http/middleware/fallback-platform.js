/**
 * Minimal no-op platform fallback for presentation middleware.
 *
 * Presentation must never import platform/ directly (boundary rule),
 * so middleware factories take `platform` by injection and fall back
 * to this local no-op implementation when no platform is injected.
 * The real platform is injected by the composition root (app.js).
 */
const fallbackLogger = {
  addTags: () => fallbackLogger,
  addData: () => fallbackLogger,
  info: () => undefined,
  error: () => undefined
};

const LoggerBuilder = {
  getLogger: () => fallbackLogger,
  getMetadataFromRequest: () => ({})
};

function logRequest() {
  return {};
}

function unifyResponse() {
  return undefined;
}

function preHandler(_request, _response, next) {
  next();
}

module.exports = { LoggerBuilder, logRequest, unifyResponse, preHandler };
