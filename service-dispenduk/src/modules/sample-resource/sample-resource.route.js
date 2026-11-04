const express = require('express');

/**
 * Creates the versioned sample resource router.
 *
 * @param {object} controller - Sample resource controllers.
 * @param {Function} [preHandler] - Optional platform authentication middleware.
 * @returns {import('express').Router} Express sample resource router.
 */
function createSampleResourceRouter(controller, preHandler) {
  const router = express.Router();
  const middleware = typeof preHandler === 'function' ? [preHandler] : [];

  router.post('/', ...middleware, controller.create);
  router.get('/', ...middleware, controller.list);
  router.get('/:id', ...middleware, controller.getById);

  return router;
}

module.exports = { createSampleResourceRouter };
