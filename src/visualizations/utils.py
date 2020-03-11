import pandas as pd
import numpy as np
from bokeh.models import Band, ColumnDataSource
from bokeh.plotting import figure, output_file, save
from bokeh.models.tools import HoverTool
from bokeh.palettes import Category10

DATA_FOLDER = "data/data_fixed"
VIEW_1_FILENAME = "view_1.html"


def plot_multiple(df):
    x_col = "Timestep"
    x_col_label = "Day"
    y_col_label = "Median"

    if x_col not in df:
        df = df.reset_index()

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
    p = figure(tools=TOOLS)

    p.multi_line(xs="xs", ys="ys", line_color="color", source=source)

    hover = HoverTool()
    hover.tooltips = [
        ("param", "@col_labels"),
        (x_col_label, "$x"),
        (y_col_label, "$y"),
    ]
    p.add_tools(hover)

    output_file(VIEW_1_FILENAME)
    save(p)


def get_dummy_data():
    # select some random file
    filepath = DATA_FOLDER + "/cities/3-0.tsv"
    df = pd.read_csv(filepath, sep="\t", index_col=0).set_index("Timestep")

    df = df[["Median"]]

    n_plots = 5  # up to 8
    for i in range(n_plots):
        df["Median_" + str(i)] = df["Median"] + i

    df = df.drop(["Median"], axis=1)
    return df


if __name__ == "__main__":

    # Prepare some dummy data
    df = get_dummy_data()

    plot_multiple(df)
