const Boom = require('@hapi/boom');
const CommonHelper = require('module-common-function');

const SENSITIVE_HEADER_NAMES = new Set(['authorization', 'cookie', 'set-cookie', 'x-api-key', 'api-key']);

/**
 * Redacts sensitive header values before they enter application logs.
 *
 * @param {Record<string, string>} headers - HTTP headers to sanitize.
 * @returns {Record<string, string>} Sanitized headers.
 */
function redactHeaders(headers = {}) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key,
      SENSITIVE_HEADER_NAMES.has(key.toLowerCase()) ? '[REDACTED]' : value
    ])
  );
}

/**
 * Creates a generic outbound HTTP client backed by the platform HTTP helper.
 *
 * @param {object} options - Client dependencies and defaults.
 * @param {number} options.timeoutMs - Default upstream timeout.
 * @param {object} [options.platform] - Platform HTTP and logging implementation.
 * @returns {object} Outbound HTTP client.
 */
function createHttpClient({ timeoutMs, platform = CommonHelper }) {
  /**
   * Executes an HTTP request while preserving supported correlation headers.
   *
   * @param {object} requestOptions - Caller-supplied upstream request options.
   * @param {object} [context] - Inbound request context for correlation.
   * @returns {Promise<object>} Upstream response.
   * @throws {Error} When the upstream request fails.
   */
  async function request(requestOptions, context = {}) {
    const headers = { ...(requestOptions.headers || {}) };
    const inboundHeaders = context.headers || {};

    for (const headerName of ['transactionid', 'x-msisdn']) {
      if (inboundHeaders[headerName] && !headers[headerName]) headers[headerName] = inboundHeaders[headerName];
    }

    const options = {
      ...requestOptions,
      headers,
      timeout: requestOptions.timeout || timeoutMs,
      rejectUnauthorized: requestOptions.rejectUnauthorized ?? true
    };

    try {
      platform.LoggerBuilder?.getLogger?.()
        .addTags?.(['http-client', 'request'])
        ?.addData?.({ method: options.method, url: options.url || options.baseURL, headers: redactHeaders(headers) })
        ?.info?.('Outbound HTTP request started');

      return await platform.CommonHttpRequest(context, inboundHeaders['x-msisdn'], options);
    } catch (error) {
      throw Boom.badGateway('Upstream service request failed', { cause: error });
    }
  }

  return { request };
}

module.exports = { createHttpClient, redactHeaders };
