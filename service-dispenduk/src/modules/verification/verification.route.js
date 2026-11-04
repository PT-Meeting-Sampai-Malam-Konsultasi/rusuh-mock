const express = require('express');

/**
 * Creates the versioned verification router.
 *
 * @param {object} controller - Verification controllers.
 * @param {Function} [preHandler] - Optional platform authentication middleware.
 * @returns {import('express').Router} Express verification router.
 */
function createVerificationRouter(controller, preHandler) {
  const router = express.Router();
  const middleware = typeof preHandler === 'function' ? [preHandler] : [];

  router.post('/', ...middleware, controller.verify);

  return router;
}

module.exports = { createVerificationRouter };
