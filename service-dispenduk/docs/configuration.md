# Configuration

Copy `.env.example` to `.env` for local development. Do not commit `.env` or place secrets in source, Postman environments, manifests, or image layers.

| Variable                               | Default  | Purpose                                                                                                                             |
| -------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                                 | `8080`   | HTTP listener port.                                                                                                                 |
| `BODY_LIMIT`                           | `100kb`  | JSON and URL-encoded request size limit.                                                                                            |
| `ENABLE_DUPLICATE_JSON_KEY_VALIDATION` | `false`  | Reject duplicate keys in the same JSON object. Enable gradually because existing callers may rely on parser last-key-wins behavior. |
| `HTTP_TIMEOUT_MS`                      | `10000`  | Default timeout for the outbound HTTP adapter.                                                                                      |
| `CACHE_ENABLED`                        | `false`  | Enables creation of the in-memory cache adapter.                                                                                    |
| `CACHE_MAX_ENTRIES`                    | `500`    | LRU cache capacity.                                                                                                                 |
| `CACHE_TTL_MS`                         | `900000` | LRU cache entry TTL in milliseconds.                                                                                                |
| `CONFIG_DB_ENABLED`                    | `false`  | Allows adopter-provided config database operations.                                                                                 |
| `CONFIG_DB_REFRESH_INTERVAL_MS`        | unset    | Optional refresh cadence; no refresh job runs without this and an adopter callback.                                                 |
| `GRACEFUL_SHUTDOWN_TIMEOUT_MS`         | `10000`  | Maximum graceful shutdown time.                                                                                                     |

`module-common-function` and `module-config-db` are internal packages. Installation requires JFrog access supplied through `ARTIFACTORY_USR` and `ARTIFACTORY_PSW`; never hard-code either value.
