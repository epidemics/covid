import pandas as pd
from bokeh.models import ColumnDataSource
from bokeh.plotting import figure, output_file, save
from bokeh.models.tools import HoverTool
from bokeh.palettes import Category10
import re
from datetime import datetime
from os.path import dirname, join
from os import getenv

DATA_FOLDER = join(getenv("ROOT_FOLDER", dirname(__file__)), "data")
SERVER_ROOT = getenv("SERVER_ROOT", "http://127.0.0.1:8000").rstrip("/")
DEFINITION_FILE = DATA_FOLDER + "/definition.xml"
VIEW_1_FILENAME = "view_1.html"
DATE_FORMAT = "%Y-%m-%d"
TARGET_COL = "Cumulative Median"


def select_city(data, city):
    if city not in data.index:
        raise RuntimeError("Unknown city")

    return data.loc[city]


def get_datasource(df, start_date):
    x_col = "Timestep"

    if x_col not in df:
        df = df.reset_index()

    # shift the timeseries by start_date
    df[x_col] = pd.to_datetime(df[x_col], unit="D", origin=pd.Timestamp(start_date))

    selected_cols = df.columns[1:]

    source = ColumnDataSource(
        data=dict(
            xs=[
                df[x_col] for _ in selected_cols
            ],  # the index is the same for all columns
            ys=[df[col] for col in selected_cols],
            col_labels=selected_cols,
            color=Category10[len(selected_cols)],
        )
    )

    return source


def plot_multiple(source, title=None):
    x_col_label = "Date"
    y_col_label = "Median"

    TOOLS = "pan,wheel_zoom,box_zoom,reset,save"
    plot = figure(tools=TOOLS, x_axis_type="datetime")

    plot.multi_line(xs="xs", ys="ys", line_color="color", source=source)

    hover = HoverTool(formatters={"$x": "datetime"})
    hover.tooltips = [
        ("param", "@col_labels"),
        (x_col_label, "$x{%Y-%m-%d}"),
        (y_col_label, "$y"),
    ]
    plot.add_tools(hover)

    plot.xaxis.axis_label = x_col_label
    plot.yaxis.axis_label = y_col_label

    plot.title.text = title

    return plot


def save_plot(plot):
    output_file(VIEW_1_FILENAME)
    save(plot)


def read_definition_file():
    with open(DEFINITION_FILE, "r") as f:
        definition = f.read()

    return definition


def get_model_start_date():
    definition = read_definition_file()
    m = re.search('startDate="(.*?)"', definition)
    start_date = m.group(1)
    start_date = datetime.strptime(start_date, DATE_FORMAT)
    return start_date


def load_view1_data():
    preprocessed_data = pd.read_parquet(DATA_FOLDER + "/city_lookup.pq")

    start_date = get_model_start_date()
    return preprocessed_data, start_date


if __name__ == "__main__":
    preprocessed_data, start_date = load_view1_data()

    source = get_datasource(preprocessed_data, start_date)
    plot = plot_multiple(source)
    save_plot(plot)
