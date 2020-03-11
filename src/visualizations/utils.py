import pandas as pd
from bokeh.models import ColumnDataSource
from bokeh.plotting import figure, output_file, save
from bokeh.models.tools import HoverTool
from bokeh.palettes import Category10
import re
from datetime import datetime

DATA_FOLDER = "data/data_fixed"
DEFINITION_FILE = DATA_FOLDER + "/definition.xml"
VIEW_1_FILENAME = "view_1.html"
DATE_FORMAT = "%Y-%m-%d"


def plot_multiple(df, start_date):
    x_col = "Timestep"
    x_col_label = "Date"
    y_col_label = "Median"

    if x_col not in df:
        df = df.reset_index()

    # shift the timeseries by start_date
    df[x_col] = pd.to_datetime(df[x_col], unit="D", origin=pd.Timestamp(start_date))

    selected_cols = df.columns[1:]

    source = ColumnDataSource(
        data=dict(
            xs=[
                df[x_col] for col in selected_cols
            ],  # the index is the same for all columns
            ys=[df[col] for col in selected_cols],
            col_labels=selected_cols,
            color=Category10[len(selected_cols)],
        )
    )

    TOOLS = "pan,wheel_zoom,box_zoom,reset,save"
    p = figure(tools=TOOLS, x_axis_type="datetime")

    p.multi_line(xs="xs", ys="ys", line_color="color", source=source)

    hover = HoverTool(formatters={"$x": "datetime"})
    hover.tooltips = [
        ("param", "@col_labels"),
        (x_col_label, "$x{%Y-%m-%d}"),
        (y_col_label, "$y"),
    ]
    p.add_tools(hover)

    p.xaxis.axis_label = x_col_label
    p.yaxis.axis_label = y_col_label

    output_file(VIEW_1_FILENAME)
    save(p)


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


def get_dummy_data():
    # select some random file
    filepath = DATA_FOLDER + "/cities/3-0.tsv"
    df = pd.read_csv(filepath, sep="\t", index_col=0).set_index("Timestep")

    df = df[["Median"]]

    n_plots = 5  # up to 8
    for i in range(n_plots):
        df["Median_" + str(i)] = df["Median"] + i

    df = df.drop(["Median"], axis=1)
    start_date = get_model_start_date()
    return df, start_date


if __name__ == "__main__":

    # Prepare some dummy data
    df, start_date = get_dummy_data()

    plot_multiple(df, start_date)
