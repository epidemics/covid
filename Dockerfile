FROM node:13-slim

WORKDIR /usr/app

ENV NODE_ENV production

COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install

COPY ./webpack.config.ts ./tsconfig.json ./

ENTRYPOINT yarn run serve