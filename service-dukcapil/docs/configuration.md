# Configuration

Copy `.env.example` to `.env` for local development. Do not commit `.env` or place secrets in source, Postman environments, manifests, or image layers.

| Variable                               | Default | Purpose                                                                                                                             |
| -------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                                 | `8080`  | HTTP listener port.                                                                                                                 |
| `BODY_LIMIT`                           | `100kb` | JSON and URL-encoded request size limit.                                                                                            |
| `ENABLE_DUPLICATE_JSON_KEY_VALIDATION` | `false` | Reject duplicate keys in the same JSON object. Enable gradually because existing callers may rely on parser last-key-wins behavior. |
| `GRACEFUL_SHUTDOWN_TIMEOUT_MS`         | `10000` | Maximum graceful shutdown time.                                                                                                     |

All dependencies are public npm packages; no private registry access is needed.
