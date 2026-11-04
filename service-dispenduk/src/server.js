require('module-alias/register');
require('dotenv').config();

const http = require('http');
const CommonHelper = require('module-common-function');
const { loadEnvironment } = require('@/config/environment');
const { createApp } = require('@/app');
const { createMemoryCache } = require('@/infrastructure/cache/memory-cache');
const { createConfigDbClient } = require('@/infrastructure/config-db/config-db.client');

/**
 * Starts the HTTP server and registers controlled shutdown handlers.
 *
 * @returns {http.Server} Active HTTP server.
 */
function startServer() {
  const config = loadEnvironment();
  const cache = config.cache.enabled ? createMemoryCache(config.cache) : undefined;
  const configDb = createConfigDbClient({ enabled: config.configDb.enabled });
  const app = createApp({ config });
  const server = http.createServer(app);
  let shuttingDown = false;

  configDb.start(config.configDb.refreshIntervalMs);

  /**
   * Stops accepting connections and exits after cleanup or the configured deadline.
   *
   * @param {string} signal - Process signal that initiated shutdown.
   * @returns {void}
   */
  function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    const logger = CommonHelper.LoggerBuilder?.getLogger?.();
    logger?.addTags?.(['server', 'shutdown'])?.addData?.({ signal })?.info?.('Graceful shutdown started');
    configDb.stop();
    cache?.clear();

    const timeout = setTimeout(() => process.exit(1), config.gracefulShutdownTimeoutMs);
    timeout.unref();
    server.close(() => {
      clearTimeout(timeout);
      process.exit(0);
    });
  }

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('uncaughtException', (error) => {
    CommonHelper.LoggerBuilder?.getLogger?.()
      .addTags?.(['server', 'uncaughtException'])
      ?.addData?.({ error: error.message })
      ?.error?.('Uncaught exception');
    shutdown('uncaughtException');
  });
  process.once('unhandledRejection', (error) => {
    CommonHelper.LoggerBuilder?.getLogger?.()
      .addTags?.(['server', 'unhandledRejection'])
      ?.addData?.({ error: error?.message })
      ?.error?.('Unhandled rejection');
    shutdown('unhandledRejection');
  });

  server.listen(config.port, () => {
    CommonHelper.LoggerBuilder?.getLogger?.()
      .addTags?.(['server', 'listen'])
      ?.addData?.({ port: config.port })
      ?.info?.('Server started');
  });

  return server;
}

if (require.main === module) startServer();

module.exports = { startServer };
