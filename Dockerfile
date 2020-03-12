FROM python:3.8-slim
ENV PYTHONUNBUFFERED 1

WORKDIR /usr/app

COPY get-poetry.py pyproject.toml poetry.lock ./
RUN \
  python get-poetry.py --yes && \
  rm get-poetry.py && \
  pip install --no-cache-dir --upgrade pip

# TODO: split into multiple Dockerfiles and add proper entrypoints
COPY ./src/charts ./src/charts
COPY ./src/server ./src/server

RUN . "$HOME/.poetry/env" && \
    poetry config virtualenvs.create false && \
    poetry install --no-dev