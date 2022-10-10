FROM node:13-slim

WORKDIR /usr/app


COPY ./package.json ./yarn.lock ./


COPY ./webpack.config.ts ./tsconfig.json ./
COPY ./server/ ./server
COPY ./common/ ./common

COPY ./build.ts ./build.ts
COPY ./static ./static
COPY ./frontend ./frontend
COPY ./country-data ./country-data
COPY ./datasets ./datasets

RUN yarn install
RUN yarn run build


FROM node:13-slim

WORKDIR /usr/app
COPY --from=0 /usr/app/dist ./dist
ENV NODE_ENV production
COPY ./package.json ./yarn.lock ./
RUN yarn install

COPY ./webpack.config.ts ./tsconfig.json ./
COPY ./server/ ./server
COPY ./common/ ./common

ENTRYPOINT yarn run serve
