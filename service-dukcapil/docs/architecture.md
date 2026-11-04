# Architecture

The service separates process lifecycle from application assembly:

- `src/server.js` loads configuration, creates optional infrastructure, binds the HTTP port, and handles shutdown signals.
- `src/app.js` exposes `createApp()`, allowing Supertest and consumers to create an Express app without binding a port.
- `src/middleware/` owns cross-cutting concerns: duplicate JSON-key rejection, response/log handling, 404 handling, and terminal error handling.
- `src/modules/` uses feature-local route, controller, service, validation, and constants files.
- `src/infrastructure/` keeps the optional in-memory cache adapter away from business modules.
- `src/platform/` is a minimal local platform shim replacing the boilerplate's private `module-common-function` package (see the service README for why).

## Request flow

1. Express disables `x-powered-by`.
2. The response adapter registers completion logging and may apply the organization response envelope.
3. JSON and URL-encoded parsers run. Duplicate JSON-key detection only runs when enabled.
4. Operational and versioned feature routes run.
5. Unknown routes pass to the 404 middleware.
6. The terminal error middleware returns a safe Boom/body-parser response or masks an unexpected failure as `500`.

The response adapter is for JSON-style API responses. Streaming and download endpoints must set `response.locals.skipResponseEnvelope = true` before writing.
