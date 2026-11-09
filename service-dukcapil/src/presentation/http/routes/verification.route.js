const express = require('express');

/**
 * Creates the versioned verification router. The endpoints are
 * intentionally unauthenticated: this is a local mock.
 *
 * @param {object} controller - Verification controllers.
 * @returns {import('express').Router} Express verification router.
 */
function createVerificationRouter(controller) {
  const router = express.Router();

  router.post('/', controller.verify);

  return router;
}

module.exports = { createVerificationRouter };
