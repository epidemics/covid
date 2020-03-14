![covid](https://github.com/epidemics/covid/workflows/covid/badge.svg)

# covid-19 visualizer
A simple POC for using `bokeh` to visualize modelled covid-19 data. 

Based on [bokeh weather example](https://github.com/bokeh/bokeh/tree/master/examples/app/weather).

## Architecture
There two main components:

* `charts` - using `bokeh serve` to serve bokeh charts
  in `src/charts` directory.
* `webserver` - a webserver using `fastapi` to render templates and embeds
  bokeh charts via the running `charts` bokeh server using JS scripts. That means that when you access the index site
  of the fastapi server, it generates the tag for the relevant chart. 

### Adding a new visualization
1. add a new chart into [charts](https://github.com/epidemics/covid/tree/master/src/charts)
2. "register" it in the `fastapi` [server](https://github.com/epidemics/covid/blob/master/src/server/main.py#L19) in the appropriate view definition.
3. add it in the [docker-compose](https://github.com/epidemics/covid/blob/master/docker-compose.yaml#L22)

# Development
## Using docker (the easiest) 
```
docker-compose up  # possibly with --build
```
and go to either `localhost:5001` (`bokeh`) or `localhost:8000` (main `server`) depending on what you want to access.

## locally/manually
Manually using [poetry](https://python-poetry.org/docs/#installation):
```
$ poetry install
$ poetry shell
```

then trigger `bokeh`:
```
$ bokeh serve --port 5001 --address 0.0.0.0 --allow-websocket-origin="*" --show src/charts/*.py
```

then start up the `fastapi` server:
```
$ cd src/server
$ uvicorn main:app --reload
```

### Using conda environments
1. [Install miniconda](https://conda.io/projects/conda/en/latest/user-guide/install/index.html#) ([e.g. Windows](https://conda.io/projects/conda/en/latest/user-guide/install/windows.html))
2. open terminal in the clonned repository and run:
```
$ conda create -n covid python=3.8  # creates a new conda environment with python 3.8
$ conda activate covid  # activates the conda environment
$ pip install poetry  # installs poetry inside this environment
$ poetry install  # installs the project dependencies (you must be in the root of the cloned repository)
```
and then you should be able to follow `locally/manually` way of triggering the server.

## Getting inside the container
```
$ docker-compose run --entrypoint bash charts
```

can be used to e.g. install deps:
```
$ docker-compose run --entrypoint poetry charts add pyarrow
```

## tests
```
poetry run pytest tests
```
or inside the container

# Deployment
We use Github Actions. The pipeline is specified in `.github/workflows/pythonapp.yml`

* On a merge to `staging` branch, the code is deployed to the staging environment.
* On a merge to `master` branch, the code is deployed to the production environment.

