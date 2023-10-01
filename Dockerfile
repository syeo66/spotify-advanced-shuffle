FROM node:18 AS base

ARG CLIENT_ID=${CLIENT_ID}
ENV CLIENT_ID=${CLIENT_ID}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /usr/src/app
COPY package.json .
COPY pnpm-lock.yaml .

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS node

COPY . .
RUN echo "CLIENT_ID=$CLIENT_ID" > .env
RUN make build

FROM nginx as server

EXPOSE 80

COPY --from=node /usr/src/app/src /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

