# Stage 1: Build the application
FROM node:20-slim AS build
WORKDIR /frontend
RUN corepack enable
COPY frontend/package.json frontend/yarn.lock frontend/.yarnrc.yml ./
RUN yarn install --immutable
# Clear esbuild cache and force rebuild
RUN rm -rf node_modules/esbuild/bin && yarn add esbuild --force

# Указываем необходимые build-args
ARG STRAPI_URL
ENV STRAPI_URL=$STRAPI_URL

ARG NUXT_PUBLIC_YANDEX_METRIKA_ID
ENV NUXT_PUBLIC_YANDEX_METRIKA_ID=$NUXT_PUBLIC_YANDEX_METRIKA_ID

COPY frontend/ .

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