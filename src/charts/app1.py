import datetime

import pandas as pd
from bokeh.io import curdoc
from bokeh.layouts import column, row
from bokeh.models import ColumnDataSource, DataRange1d, RadioGroup, Select
from bokeh.palettes import Blues4

from utils import plot_multiple, get_datasource, get_dummy_data, get_datasource


def update_plot(attrname, old, new):
    city = city_select.value
    plot.title.text = "COVID-19 data for " + city

    # src = get_dataset(df, cities[city]["airport"], distribution_select.value)
    data_city = select_city(df, city)
    src = get_datasource(data_city, start_date)
    source.data.update(src.data)


# Prepare some dummy data
df, start_date = get_dummy_data()

# get city selection
cities = df.reset_index()["City"].unique()

city = "New York"
distribution = "Discrete"

city_select = Select(value=city, title="Area", options=cities)
distribution_select = Select(
    value=distribution, title="Distribution", options=["Discrete", "Smoothed"]
)
# TODO: this one doesn't do anything yet
countermeasures = Select(
    options=["0", "25%", "50%", "75%"],
    value="50%",
    title="reduction transmission due countermeasures",
)

data_city = select_city(df, city)
source = get_datasource(data_city, start_date)
plot = plot_multiple(source, title="COVID-19 data for " + city)

city_select.on_change("value", update_plot)
distribution_select.on_change("value", update_plot)

controls = column(city_select, distribution_select, countermeasures)

curdoc().add_root(row(plot, controls))
curdoc().title = "covid-1"
