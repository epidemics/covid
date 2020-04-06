FROM node:13-slim

WORKDIR /usr/app

ENV NODE_ENV production

COPY ./package.json ./yarn.lock ./

RUN yarn install

COPY ./webpack.config.ts ./tsconfig.json ./
COPY ./server/ ./server

ENTRYPOINT yarn run serve