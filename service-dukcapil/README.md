# service-dukcapil

Dukcapil NIK verification mock for rusuh — a stand-in third-party service with synthetic data. Not a production verification path (see D22 in the repo README).

## Proposed contract (not yet a team decision)

`POST /api/v1/verifications` — for purchase-time NIK checks (NIK is input only at purchase; registration collects no NIK). Whether a negative verdict blocks the purchase is still open.

Request:

```json
{ "nik": "3171010101900001" }
```

- `nik`: the only input (required). NIK-only by design: at purchase there is no name input per ticket to verify against.

Real-format rules checked (structure, not a registry lookup):

- 16 digits: province (2) + regency/city (2) + district (2) + birth date DDMMYY (6) + sequence (4).
- Birth date component valid: month 01-12, day valid for the month, day + 40 for females (41-71).
- Sequence not 0000 (sequences start at 0001).
- Region codes are not checked against the Kemendagri table (that needs the full region registry).

Response `200` (unknown NIKs are results, not errors):

```json
{ "data": { "nik": "3171010101900001", "valid": true, "reason": null } }
```

- `valid: true, reason: null` — NIK found in the dataset.
- `valid: false, reason: "NIK_NOT_FOUND"` — NIK not in the dataset.
- `400` — malformed request (NIK failing the real-format rules, missing nik, malformed JSON, duplicate JSON keys when enabled).

OpenAPI: `docs/openapi.yaml`. Postman: `postman/collections/service-dukcapil/`.

## Synthetic dataset

Three invented NIKs in `src/modules/verification/verification.data.js`, all in the real Indonesian format so dummy data still looks authentic:

- `3171010101900001` — Jakarta Pusat, male, born 1 Jan 1990, sequence 0001.
- `3171014101900002` — Jakarta Pusat, female, born 1 Jan 1990 (day + 40), sequence 0002.
- `3271010202850003` — Kota Bogor, male, born 2 Feb 1985, sequence 0003.

The persons are invented, but because the format is real, an entry could in theory coincide with a real person's NIK — everything in this repo is marked synthetic for that reason. The dataset is fixed and tiny by design: verification must be deterministic (same input → same response) so demos and tests never go flaky.

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
  -d '{"nik":"3171010101900001"}'
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

The consuming service calls this mock at purchase time (when ticket NIKs are entered) via interface + config (`MOCK_URL` vs the real Dukcapil URL); swapping mock → real is a config change only. A `valid` verdict from this mock must never be treated as real verification in production.

## Deviations from the boilerplate template

- Private Telkomsel packages (`module-common-function`, `module-config-db`) removed: they require JFrog credentials that do not exist outside Telkomsel, which would make this public repo un-installable. Replaced by `src/platform/common.js`, a minimal local shim implementing only the surface the service uses (chainable console logger, no-op metadata, pass-through preHandler). All template calls to the platform use optional chaining, so behavior is preserved.
- Config-DB adapter removed (it depended on the private package and the mock needs no config DB); `CONFIG_DB_*` variables removed.
- Outbound HTTP adapter removed (the mock calls no upstream).
- `sample-resource` example module replaced by the `verification` module.
- GitLab CI, Kustomize manifests, and Sonar properties dropped: this repo uses GitHub + ECS (via `rusuh-infra`), not GitLab + Kubernetes.
- Dockerfile no longer needs an npm registry secret (all dependencies are public).
- `HTTP_TIMEOUT_MS` removed (it only served the dropped HTTP adapter).
- Environment validation now tolerates unrelated variables: the template rejected any unknown env var (`.unknown(false)`), which made the server unstartable in any normal shell (PATH, HOME, and similar variables are always set). Changed to `.unknown(true)` so known variables are still validated but the rest are ignored.

## Revisions after the first scaffold

- Renamed from `service-dispenduk` to `service-dukcapil` (5 Nov feedback: the name better reflects the service).
- Name removed from the contract: NIK is the only input at purchase, and registration collects no NIK, so there is no name to verify against. The earlier NIK + name design is superseded.
- 99-province-block dataset replaced with real-format entries (5 Nov feedback: dummy data should look authentic); the coincidence trade-off is noted in the dataset section above.
