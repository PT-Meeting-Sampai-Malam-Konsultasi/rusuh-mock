# Deployment

The Dockerfile uses a multi-stage build with public npm dependencies only (no registry secrets needed):

```sh
docker build -t service-dukcapil:local .
```

The image is non-root and probes `/health/live` and `/health/ready`. Do not use `exec` probes that require shell utilities in the distroless runtime image.

In rusuh, the service is deployed via the `rusuh-infra` compute module (ECS + ALB); the image reference is supplied to that module at apply time. There are no Kustomize manifests and no GitLab CI in this repo (GitHub + ECS are the platforms).
