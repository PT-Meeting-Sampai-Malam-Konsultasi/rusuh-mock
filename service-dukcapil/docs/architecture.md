# Architecture

The service follows strict Onion / Clean Architecture (same layout as the rusuh-core modules). Dependencies point inward only; the rule is enforced by `scripts/check-boundaries.js` (repo root), wired into `npm run check` as `check:boundaries`.

- `src/domain/` — pure business logic: NIK format rules and format-only verification. Only node built-ins and other domain files.
- `src/application/` — use cases (verification, health). May import application, domain, and npm packages.
- `src/infrastructure/` — adapters: validated configuration and the synthetic resident dataset (test fixture and documentation examples only — never a runtime lookup). Never imports presentation.
- `src/presentation/http/` — routes, controllers, middleware, and validation. Never imports infrastructure. The platform shim is received by injection, never imported directly (a local no-op fallback lives in `presentation/http/middleware/fallback-platform.js`).
- `src/container.js` — the composition root: the only place that imports from every layer to wire use cases, controllers, and routers together.
- `src/app.js` — thin: calls the container and mounts routes. Exposes `createApp()`, allowing Supertest and consumers to create an Express app without binding a port.
- `src/server.js` — loads configuration, binds the HTTP port, and handles shutdown signals.
- `src/platform/` is a minimal local platform shim replacing the boilerplate's private `module-common-function` package (see the service README for why).

## Request flow

1. Express disables `x-powered-by`.
2. Helmet sets security headers; CORS allows only the configured origins (`CORS_ORIGINS`, see README).
3. The response adapter registers completion logging and may apply the organization response envelope.
4. JSON and URL-encoded parsers run. Duplicate JSON-key detection only runs when enabled.
5. Operational and versioned feature routes run.
6. Unknown routes pass to the 404 middleware.
7. The terminal error middleware returns a safe Boom/body-parser response or masks an unexpected failure as `500`.

The response adapter is for JSON-style API responses. Streaming and download endpoints must set `response.locals.skipResponseEnvelope = true` before writing.

## Verification result and readiness

Verification is format-only and surfaces a single reason code: any format failure (wrong length, non-digit characters, invalid birth-date component, sequence `0000`) returns `valid: false` with `reason: "NIK_INVALID_FORMAT"`, so clients map one code to one message.

`/health/ready` runs a functional self-test of the verifier (a known-valid NIK must verify true, a known-invalid NIK must verify false) and answers `200 {"status":"ready"}` only when it passes, otherwise `503 {"status":"not_ready"}`. The service has no downstream dependency, so the self-test — not a dependency ping — is what "ready" means here.
