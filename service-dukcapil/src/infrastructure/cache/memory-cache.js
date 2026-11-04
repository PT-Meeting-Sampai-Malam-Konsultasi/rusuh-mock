const { LRUCache } = require('lru-cache');

/**
 * Creates an in-memory cache adapter for optional cache-aside use cases.
 *
 * @param {object} options - Cache configuration.
 * @param {number} options.maxEntries - Maximum cache entries.
 * @param {number} options.ttlMs - Default item time-to-live in milliseconds.
 * @returns {object} Cache adapter.
 */
function createMemoryCache({ maxEntries, ttlMs }) {
  const cache = new LRUCache({ max: maxEntries, ttl: ttlMs });

  return {
    get: (key) => cache.get(key),
    set: (key, value, options) => cache.set(key, value, options),
    delete: (key) => cache.delete(key),
    clear: () => cache.clear()
  };
}

module.exports = { createMemoryCache };
