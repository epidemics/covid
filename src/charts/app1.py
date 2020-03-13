from bokeh.io import curdoc
from bokeh.layouts import column, row
from bokeh.models import Select

from charts.utils import (
    plot_multiple,
    get_datasource,
    load_view1_data,
    get_datasource,
    select_city,
)


def update_plot(attrname, old, new):
    city = city_select.value
    plot.title.text = "COVID-19 data for " + city

    data_city = select_city(preprocessed_data, city)
    src = get_datasource(data_city, start_date)
    source.data.update(src.data)


# Load data
preprocessed_data, start_date = load_view1_data()

# get city selection
cities = list(preprocessed_data.reset_index()["City"].unique())

city = "New York"
distribution = "Discrete"

city_select = Select(value=city, title="Area", options=cities)
distribution_select = Select(
    value=distribution, title="Distribution", options=["Discrete", "Smoothed"]
)
# TODO: this one doesn't do anything yet
countermeasures = Select(
    options=["0%", "25%", "50%", "75%"],
    value="50%",
    title="Reduction transmission due countermeasures",
)

data_city = select_city(preprocessed_data, city)
source = get_datasource(data_city, start_date)
plot = plot_multiple(source, title="COVID-19 data for " + city)

city_select.on_change("value", update_plot)
distribution_select.on_change("value", update_plot)

controls = column(city_select, distribution_select, countermeasures)

curdoc().add_root(row(plot, controls))
curdoc().title = "covid-1"
