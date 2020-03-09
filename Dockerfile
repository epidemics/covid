FROM python:3.8-slim
ENV PYTHONUNBUFFERED 1

WORKDIR /usr/src/

COPY get-poetry.py pyproject.toml poetry.lock ./
RUN \
  python get-poetry.py --yes && \
  . "$HOME/.poetry/env" && \
  poetry config virtualenvs.create false && \
  rm get-poetry.py && \
  pip install --no-cache-dir --upgrade pip && \
  poetry install --no-dev

# TODO: split into multiple Dockerfiles and add proper entrypoints
COPY ./src/charts ./charts
COPY ./src/server ./server