## Install pnpm
FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

## Dependencies
FROM base AS dependencies

WORKDIR /www

COPY package.json pnpm-lock.yaml panda.config.ts ./
RUN pnpm install

## Build stage
FROM dependencies AS build

ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

ARG SENTRY_RELEASE_NAME
ENV SENTRY_RELEASE_NAME=$SENTRY_RELEASE_NAME

WORKDIR /www
COPY . .
COPY --from=dependencies /www/node_modules ./node_modules
RUN pnpm run build && pnpm store prune && pnpm prune --prod --config.ignore-scripts=true

## Runtime
FROM base AS runtime

WORKDIR /www

COPY --from=build /www/build /www/build
COPY --from=build /www/node_modules /www/node_modules
COPY --from=build /www/public /www/public
COPY --from=build /www/package.json /www/package.json
COPY --from=build /www/instrumentation.server.mjs /www/instrumentation.server.mjs

RUN apk add --no-cache curl

EXPOSE 3000
ENV NODE_ENV=production
HEALTHCHECK CMD curl --fail http://localhost:3000 || exit 1
CMD ["pnpm", "run", "start"]
