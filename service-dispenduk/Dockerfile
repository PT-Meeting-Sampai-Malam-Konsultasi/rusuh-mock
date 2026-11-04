# syntax=docker/dockerfile:1.7
FROM node:20.16.0-bookworm-slim AS dependencies
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci --omit=dev --ignore-scripts && \
    node -e "for (const dependency of ['express', 'joi', '@hapi/boom', 'module-common-function', 'module-config-db']) require.resolve(dependency)"

FROM gcr.io/distroless/nodejs20-debian12:nonroot
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=dependencies --chown=nonroot:nonroot /usr/src/app/node_modules ./node_modules
COPY --chown=nonroot:nonroot package.json ./package.json
COPY --chown=nonroot:nonroot src ./src
USER nonroot
EXPOSE 8080
CMD ["src/server.js"]
