![covid](https://github.com/epidemics/covid/workflows/covid/badge.svg)

# covid-19 visualizer
A simple POC for using `bokeh` to visualize modelled covid-19 data. 

Based on [bokeh weather example](https://github.com/bokeh/bokeh/tree/master/examples/app/weather).

## Architecture
There two main components:

* `charts` - using `bokeh serve` to serve bokeh charts
  in `src/charts` directory.
* `webserver` - a webserver using `fastapi` to render templates and embeds
  bokeh charts via the running `charts` bokeh server using JS scripts. 

# Development
## Using docker (the easiest) 
```
docker-compose up
```
and go to either `localhost:5001` (`bokeh`) or `localhost:8000` (main `server`) depending on what you want to access.

## locally/manually (linux/mac)
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
