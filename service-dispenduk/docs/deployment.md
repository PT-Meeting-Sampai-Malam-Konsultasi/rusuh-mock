# Deployment

The Dockerfile uses a multi-stage build. The dependency stage reads private npm configuration through a BuildKit secret, which keeps Artifactory credentials out of image layers:

```sh
docker build --secret id=npmrc,src=.npmrc -t {{SERVICE_NAME}}:local .
```

Kustomize files live under `deploy/kustomize/`:

- `base/` provides generic Deployment, Service, HPA, and PDB resources.
- `overlays/development/` provides a safe example overlay.

Before deployment, replace every `{{...}}` placeholder with service-owned values, add secret references only through approved platform mechanisms, and render before applying:

```sh
kubectl kustomize deploy/kustomize/base
kubectl kustomize deploy/kustomize/overlays/development
```

The image is non-root and probes `/health/live` and `/health/ready`. Do not use `exec` probes that require shell utilities in the distroless runtime image.
