FROM python:3.8-slim as production
ENV PYTHONUNBUFFERED 1

WORKDIR /usr/app

COPY get-poetry.py pyproject.toml poetry.lock ./
RUN \
  python get-poetry.py --yes && \
  rm get-poetry.py && \
  pip install --no-cache-dir --upgrade pip

# TODO: split into multiple Dockerfiles and add proper entrypoints
COPY ./src ./src/

RUN . "$HOME/.poetry/env" && \
    poetry config virtualenvs.create false && \
    poetry install --no-dev

FROM production as development
ENV PATH="/root/.poetry/bin:${PATH}"
RUN poetry install