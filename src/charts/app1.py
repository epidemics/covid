import datetime

import pandas as pd
from bokeh.io import curdoc
from bokeh.layouts import column, row
from bokeh.models import ColumnDataSource, DataRange1d, RadioGroup, Select
from bokeh.palettes import Blues4

from utils import plot_multiple, get_datasource, get_dummy_data, get_datasource


def update_plot(attrname, old, new):
    city = city_select.value
    plot.title.text = "Weather data for " + cities[city]["title"]

    # src = get_dataset(df, cities[city]["airport"], distribution_select.value)
    src = get_datasource(df, start_date)
    source.data.update(src.data)


city = "Austin"
distribution = "Discrete"

cities = {
    "Austin": {"airport": "AUS", "title": "Austin, TX",},
    "Boston": {"airport": "BOS", "title": "Boston, MA",},
    "Seattle": {"airport": "SEA", "title": "Seattle, WA",},
}

city_select = Select(value=city, title="Area", options=sorted(cities.keys()))
distribution_select = Select(
    value=distribution, title="Distribution", options=["Discrete", "Smoothed"]
)
# TODO: this one doesn't do anything yet
countermeasures = Select(
    options=["0", "25%", "50%", "75%"],
    value="50%",
    title="reduction transmission due countermeasures",
)


# Prepare some dummy data
df, start_date = get_dummy_data()
source = get_datasource(df, start_date)
plot = plot_multiple(source, title="COVID-19 data for " + cities[city]["title"])

city_select.on_change("value", update_plot)
distribution_select.on_change("value", update_plot)

controls = column(city_select, distribution_select, countermeasures)

curdoc().add_root(row(plot, controls))
curdoc().title = "covid-1"
