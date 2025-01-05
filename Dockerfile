FROM node:21-alpine3.19

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci

COPY src src
COPY static static

RUN npm run tcs
CMD ["npm", "run", "start"]
