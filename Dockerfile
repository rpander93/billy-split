## Install pnpm
FROM node:22-alpine AS base

RUN npm install -g pnpm

## Dependencies
FROM base as dependencies
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
RUN pnpm run build
RUN pnpm prune --prod

## Runtime
FROM base AS runtime

WORKDIR /www

COPY --from=build /www/build /www/build
COPY --from=build /www/node_modules /www/node_modules
COPY --from=build /www/public /www/public
COPY --from=build /www/package.json /www/package.json

EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "run", "start"]