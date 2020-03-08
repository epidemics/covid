# covid-19 visualizer
A simple POC for using `bokeh` to visualize modelled covid-19 data. 

Based on [bokeh weather example](https://github.com/bokeh/bokeh/tree/master/examples/app/weather).

# Development
Using docker (the easiest): 
```
docker-compose up
```

or manually using poetry:
```
$ poetry install
$ poetry shell
$ bokeh serve --port 5001 --address 0.0.0.0 --allow-websocket-origin=0.0.0.0:5001 --show src/app
```

and in both cases you should be able to access the dashboard in your browser at http://0.0.0.0:5001
