FROM node:21-alpine3.19 AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY src src

RUN npm ci

RUN npm run tsc

FROM node:21-alpine3.19

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY static static
COPY templates templates
COPY --from=build app/dist dist

CMD ["node", "dist"]

