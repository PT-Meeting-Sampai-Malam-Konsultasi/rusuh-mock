const { randomUUID } = require('crypto');
const Boom = require('@hapi/boom');
const { SAMPLE_RESOURCE_NOT_FOUND } = require('./sample-resource.constant');

/**
 * Creates the non-durable in-memory sample resource service.
 *
 * @param {Map<string, object>} [store] - Optional backing store for tests.
 * @returns {object} Sample resource operations.
 */
function createSampleResourceService(store = new Map()) {
  return {
    /**
     * Creates and stores a sample resource.
     *
     * @param {object} input - Validated sample resource fields.
     * @returns {object} Created resource.
     */
    create(input) {
      const resource = {
        id: randomUUID(),
        ...input,
        createdAt: new Date().toISOString()
      };
      store.set(resource.id, resource);
      return resource;
    },

    /**
     * Lists all in-memory sample resources.
     *
     * @returns {object[]} Stored sample resources.
     */
    list() {
      return Array.from(store.values());
    },

    /**
     * Retrieves a sample resource by identifier.
     *
     * @param {string} id - Resource identifier.
     * @returns {object} Requested resource.
     * @throws {Error} When the resource does not exist.
     */
    getById(id) {
      const resource = store.get(id);
      if (!resource) throw Boom.notFound(SAMPLE_RESOURCE_NOT_FOUND);
      return resource;
    }
  };
}

module.exports = { createSampleResourceService };
