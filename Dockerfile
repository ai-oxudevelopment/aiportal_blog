# syntax = docker/dockerfile:1

# Указываем необходимые build-args
ARG STRAPI_URL
ENV STRAPI_URL=$STRAPI_URL

# Stage 1: Build the application
FROM node:20-slim AS build
WORKDIR /frontend
RUN corepack enable
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY frontend/ .
COPY .env ./frontend/.env

RUN yarn build

# Stage 2: Production image
FROM node:20-slim AS runner
WORKDIR /frontend
ENV NODE_ENV=production

COPY --from=build /frontend/.output ./.output
COPY --from=build /frontend/node_modules ./node_modules
COPY --from=build /frontend/package.json ./package.json

EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]