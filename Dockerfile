FROM node:21-alpine3.19

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci

COPY *.js ./
COPY static static
COPY templates templates
COPY gloo gloo

CMD ["npm", "start"]
