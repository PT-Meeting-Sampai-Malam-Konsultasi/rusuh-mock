# Node.js Service Boilerplate

Production-ready starting point for a MyTelkomsel Node.js service. It provides a CommonJS/Express runtime, feature modules, validation and safe errors, tests, an OpenAPI contract, local Postman collection, container build, GitLab CI, and Kustomize assets.

## Before adopting

Replace every `{{SERVICE_NAME}}`, `{{CONTAINER_IMAGE}}`, `{{DEVELOPMENT_NAMESPACE}}`, `{{DEVELOPMENT_CONTAINER_IMAGE}}`, and `{{IMAGE_TAG}}` placeholder. The sample resource is intentionally in-memory and **not** a persistence pattern.

This template retains `module-common-function` and `module-config-db`. Installing dependencies requires access to the internal JFrog repository using `ARTIFACTORY_USR` and `ARTIFACTORY_PSW`. Do not place those values in tracked files.

## Quick start

```sh
cp .env.example .env
npm install --ignore-scripts
npm start
```

In a second shell:

```sh
curl http://localhost:8080/sys/ping
curl http://localhost:8080/health/live
curl -X POST http://localhost:8080/api/v1/sample-resources \
  -H 'content-type: application/json' \
  -d '{"name":"Example resource","description":"Non-durable sample"}'
```

## Commands

| Command                   | Purpose                                                                      |
| ------------------------- | ---------------------------------------------------------------------------- |
| `npm start`               | Start the HTTP server on `PORT` (default `8080`).                            |
| `npm run lint`            | Check JavaScript style without modifying files.                              |
| `npm run lint:fix`        | Apply ESLint fixes.                                                          |
| `npm run format:check`    | Check Prettier formatting.                                                   |
| `npm run test`            | Run Jest tests.                                                              |
| `npm run test:coverage`   | Run tests and create LCOV, Cobertura, and JUnit reports.                     |
| `npm run api:lint`        | Validate `docs/openapi.yaml`.                                                |
| `npm run postman:run`     | Run the filesystem-first local Postman collection against a running service. |
| `npm run kustomize:build` | Render the base and development Kustomize resources.                         |
| `npm run check`           | Run format, lint, unit/integration tests, and OpenAPI linting.               |

## Project structure

```text
src/
  app.js                  Express application factory
  server.js               Process lifecycle and graceful shutdown
  config/                 Validated runtime configuration
  middleware/             Parser, response, 404, and error handling
  modules/                Feature-local route/controller/service/validation code
  infrastructure/         Optional HTTP, cache, and config DB adapters
postman/                  Local v3 collection and environment
docs/                     Architecture, configuration, deployment, OpenAPI
deploy/kustomize/         Generic base and development overlay
```

## API contract and collection

`docs/openapi.yaml` documents `/sys/ping`, health endpoints, and sample-resource endpoints. `postman/collections/nodejs-service-boilerplate/` uses Postman v3 filesystem format. Start the service before running `npm run postman:run`.

## Deployment

See [docs/deployment.md](docs/deployment.md). The Docker build consumes an npm configuration only through BuildKit secrets and uses a non-root distroless runtime. The manifests include no real namespace, endpoint, credential, image, or secret reference.

## Further documentation

- [Architecture](docs/architecture.md)
- [Configuration](docs/configuration.md)
- [Deployment](docs/deployment.md)
