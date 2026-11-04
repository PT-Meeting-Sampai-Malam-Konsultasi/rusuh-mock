# service-dukcapil

Dukcapil NIK verification mock for rusuh — a stand-in third-party service with synthetic data. Not a production verification path (see D22 in the repo README).

## Proposed contract (not yet a team decision)

`POST /api/v1/verifications` — Q36 (when Dukcapil verification gates) is still open; this contract is a proposal for team review, not a decided interface.

Request:

```json
{ "nik": "9901010101900001", "name": "Budi Santoso" }
```

- `nik`: 16-digit string (required).
- `name`: 1–100 chars (required), matched case-insensitively after trimming.

Response `200` (unknown NIKs and name mismatches are results, not errors):

```json
{ "data": { "nik": "9901010101900001", "valid": true, "name": "Budi Santoso", "reason": null } }
```

- `valid: true, reason: null` — NIK found and name matches.
- `valid: false, reason: "NAME_MISMATCH"` — NIK found, name differs.
- `valid: false, reason: "NIK_NOT_FOUND"` — NIK not in the dataset.
- `400` — malformed request (NIK not 16 digits, missing name, malformed JSON, duplicate JSON keys when enabled).

OpenAPI: `docs/openapi.yaml`. Postman: `postman/collections/service-dukcapil/`.

## Synthetic dataset

Three invented residents in `src/modules/verification/verification.data.js`. All NIKs use the `99` province block, which does not exist in Indonesia, so no entry can collide with a real NIK while still satisfying the 16-digit format. The dataset is fixed and tiny by design: verification must be deterministic (same input → same response) so demos and tests never go flaky.

## Quick start

```sh
cp .env.example .env
npm install --ignore-scripts
npm start
```

Then:

```sh
curl http://localhost:8080/sys/ping
curl http://localhost:8080/health/live
curl -X POST http://localhost:8080/api/v1/verifications \
  -H 'content-type: application/json' \
  -d '{"nik":"9901010101900001","name":"Budi Santoso"}'
```

## Commands

| Command                 | Purpose                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| `npm start`             | Start the HTTP server on `PORT` (default `8080`).                            |
| `npm run lint`          | Check JavaScript style without modifying files.                              |
| `npm run lint:fix`      | Apply ESLint fixes.                                                          |
| `npm run format:check`  | Check Prettier formatting.                                                   |
| `npm run test`          | Run Jest tests.                                                              |
| `npm run test:coverage` | Run tests and create LCOV, Cobertura, and JUnit reports.                     |
| `npm run api:lint`      | Validate `docs/openapi.yaml`.                                                |
| `npm run postman:run`   | Run the filesystem-first local Postman collection against a running service. |
| `npm run check`         | Run format, lint, unit/integration tests, and OpenAPI linting.               |

## Project structure

```text
src/
  app.js                  Express application factory
  server.js               Process lifecycle and graceful shutdown
  config/                 Validated runtime configuration
  middleware/             Parser, response, 404, and error handling
  modules/                Feature-local route/controller/service/validation code
  infrastructure/         Optional in-memory cache adapter
  platform/               Local platform shim (replaces the private template package)
postman/                  Local v3 collection and environment
docs/                     Architecture, configuration, deployment, OpenAPI
```

## How consumers use it (D22)

The consuming service calls this mock via interface + config (`MOCK_URL` vs the real Dukcapil URL); swapping mock → real is a config change only. A `valid` verdict from this mock must never be treated as real verification in production.

## Deviations from the boilerplate template

- Private Telkomsel packages (`module-common-function`, `module-config-db`) removed: they require JFrog credentials that do not exist outside Telkomsel, which would make this public repo un-installable. Replaced by `src/platform/common.js`, a minimal local shim implementing only the surface the service uses (chainable console logger, no-op metadata, pass-through preHandler). All template calls to the platform use optional chaining, so behavior is preserved.
- Config-DB adapter removed (it depended on the private package and the mock needs no config DB); `CONFIG_DB_*` variables removed.
- Outbound HTTP adapter removed (the mock calls no upstream).
- `sample-resource` example module replaced by the `verification` module.
- GitLab CI, Kustomize manifests, and Sonar properties dropped: this repo uses GitHub + ECS (via `rusuh-infra`), not GitLab + Kubernetes.
- Dockerfile no longer needs an npm registry secret (all dependencies are public).
- `HTTP_TIMEOUT_MS` removed (it only served the dropped HTTP adapter).
- Environment validation now tolerates unrelated variables: the template rejected any unknown env var (`.unknown(false)`), which made the server unstartable in any normal shell (PATH, HOME, and similar variables are always set). Changed to `.unknown(true)` so known variables are still validated but the rest are ignored.
