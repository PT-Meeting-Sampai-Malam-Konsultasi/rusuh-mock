const CommonHelper = require('module-common-function');

/**
 * Creates a disabled-by-default configuration database adapter.
 *
 * @param {object} options - Adapter dependencies and configuration.
 * @param {boolean} options.enabled - Whether the adapter may execute retrieval callbacks.
 * @param {Function} [options.fetchConfig] - Adopter-provided configuration lookup callback.
 * @param {Function} [options.refreshConfig] - Adopter-provided refresh callback.
 * @param {object} [options.platform] - Platform logging implementation.
 * @returns {object} Configuration database adapter.
 */
function createConfigDbClient({ enabled, fetchConfig, refreshConfig, platform = CommonHelper }) {
  let refreshTimer;

  /**
   * Retrieves adopter-owned configuration only when explicitly enabled.
   *
   * @param {string} key - Adopter-defined configuration key.
   * @param {object} [context] - Request or tracing context.
   * @returns {Promise<unknown>} Retrieved configuration, or undefined when disabled.
   */
  async function get(key, context) {
    if (!enabled || !fetchConfig) return undefined;
    return fetchConfig(key, context);
  }

  /**
   * Runs an adopter-provided refresh callback and logs a failure safely.
   *
   * @returns {Promise<void>}
   */
  async function refresh() {
    if (!enabled || !refreshConfig) return;

    try {
      await refreshConfig();
    } catch (error) {
      platform.LoggerBuilder?.getLogger?.()
        .addTags?.(['config-db', 'refresh'])
        ?.addData?.({ error: error.message })
        ?.error?.('Configuration database refresh failed');
    }
  }

  /**
   * Starts optional periodic refresh work and returns its timer handle.
   *
   * @param {number|null} intervalMs - Refresh cadence in milliseconds.
   * @returns {NodeJS.Timeout|undefined} Refresh timer when configured.
   */
  function start(intervalMs) {
    if (!enabled || !refreshConfig || !intervalMs) return undefined;
    refreshTimer = setInterval(refresh, intervalMs);
    return refreshTimer;
  }

  /**
   * Stops an active configuration refresh timer.
   *
   * @returns {void}
   */
  function stop() {
    if (refreshTimer) clearInterval(refreshTimer);
  }

  return { get, refresh, start, stop };
}

module.exports = { createConfigDbClient };
