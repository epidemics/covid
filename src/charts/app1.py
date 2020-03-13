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

    data_city = select_city(city_lookup, city)
    src = get_datasource(data_city, start_date)
    source.data.update(src.data)


# Load data
city_lookup, start_date = load_view1_data()

# get city selection
cities = list(city_lookup.reset_index()["City"].unique())

query_args = curdoc().session_context.request.arguments
try:
    city = query_args.get("city")[0].decode()
except:
    city = "New York"
if not city in cities:
    # TODO: Some exception handling
    pass

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

data_city = select_city(city_lookup, city)
source = get_datasource(data_city, start_date)
plot = plot_multiple(source, title="COVID-19 data for " + city)

city_select.on_change("value", update_plot)
distribution_select.on_change("value", update_plot)

controls = column(city_select, distribution_select, countermeasures)

curdoc().add_root(row(plot, controls))
curdoc().title = "covid-1"
