# rusuh-mock

Stand-in (mock) third-party services for rusuh development and
testing — not a production path. Follows D22: identical interface to
the real service, deterministic, synthetic data, selected via config.

## Planned services (only 1 for now)

- `service-dispenduk` — NIK verification (Dukcapil stand-in). This is
  the only service in this repo for now.

## Stack

Node.js. Implementation follows the provided Node.js project template
(boilerplate) — service structure follows that template.

## Principles (D22)

- Interface identical to the real service (endpoints, request/response
  formats) so the application needs no changes when swapping.
- Deterministic: same input → same response (good for tests and demos).
- Synthetic data only. This repo is PUBLIC — no real NIKs, no real
  resident data, no credentials, and no secrets of any kind here.
- Not a production path: the application must not call the mock in
  production; mock vs real selection happens via config.
- Q36 (when Dukcapil verification gates — proposal: registration only)
  is still open in team discussion. This mock does not decide that;
  it only provides the stand-in.

## Branch flow

- `main` = reviewed state. This repo's initiation (README) is the
  only commit made directly to `main`.
- Feature work goes through a feature branch + review first (same as
  rusuh-infra).

## Layout (planned)

```
service-dispenduk/   # scaffolded from the Node.js template
```

## Status

- 4 Nov 2026: repo created, README initiated. Template received
  (Node.js service boilerplate); `service-dispenduk` is being
  scaffolded on a feature branch.
