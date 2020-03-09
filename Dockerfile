FROM python:3.8-slim
ENV PYTHONUNBUFFERED 1 ORIGIN="127.0.0.1:5100" PORT="5100" PREFIX="" LOG_LEVEL="info"

WORKDIR /usr/src/

COPY get-poetry.py pyproject.toml poetry.lock entrypoint.sh ./
RUN \
  python get-poetry.py --yes && \
  . "$HOME/.poetry/env" && \
  poetry config virtualenvs.create false && \
  rm get-poetry.py && \
  pip install --no-cache-dir --upgrade pip && \
  poetry install --no-dev && \
  chmod +x entrypoint.sh

COPY ./src/charts ./charts
COPY ./src/server ./server