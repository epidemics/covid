FROM node:13-slim AS webpack

WORKDIR /usr/app

COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install

COPY  ./webpack.config.js ./tsconfig.json ./