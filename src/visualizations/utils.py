import pandas as pd
from bokeh.models import Band, ColumnDataSource
from bokeh.plotting import figure, output_file, save
from bokeh.models.tools import HoverTool

DATA_FOLDER = "data/data_fixed"
VISUALIZATION1_FILENAME = "view_1.html"
FIGURE_MARGIN = 0.1


def _get_figure_yrange(df, lower_col, upper_col):
    y_min = df[lower_col].min()
    y_max = df[upper_col].max()
    y_range = y_max - y_min
    y_min = y_min - FIGURE_MARGIN * y_range
    y_max = y_max + FIGURE_MARGIN * y_range
    return y_min, y_max


def plot_CI(df: pd.DataFrame, title: str = None, cumulative: bool = False):
    x_col = "Timestep"
    y_col = "Median"
    lower_col = "Lower 95%CI"
    upper_col = "Upper 95%CI"

    x_col_label = "Day"
    y_col_label = "Median + 95%CI"

    if cumulative:
        cum = "Cumulative "
        y_col = cum + y_col
        lower_col = cum + lower_col
        upper_col = cum + upper_col

    if "Timestep" not in df:
        df = df.reset_index()

    source = ColumnDataSource(df)

    TOOLS = "pan,wheel_zoom,box_zoom,reset,save"

    y_range = _get_figure_yrange(df, lower_col, upper_col)

    p = figure(tools=TOOLS, y_range=y_range)

    p.line(x=x_col, y=y_col, line_color=None, source=source)

    band = Band(
        base=x_col,
        lower=lower_col,
        upper=upper_col,
        source=source,
        level="underlay",
        fill_color="skyblue",
        fill_alpha=1.0,
        line_width=1,
        line_color="black",
    )
    p.add_layout(band)

    hover = HoverTool(mode="vline")

    ci_values = "[@{%s}, @{%s}]" % (lower_col, upper_col)

    hover.tooltips = [
        (y_col, "@" + y_col),  # median
        ("CI95%", ci_values),
        (x_col_label, "@" + x_col),  # day
    ]
    p.add_tools(hover)

    if title is not None:
        p.title.text = title

    p.xgrid[0].grid_line_color = None
    p.ygrid[0].grid_line_alpha = 0.5

    p.xaxis.axis_label = x_col_label
    p.yaxis.axis_label = y_col_label

    output_file(VISUALIZATION1_FILENAME)
    save(p)


if __name__ == "__main__":
    # select some random file
    filepath = DATA_FOLDER + "/cities/3-0.tsv"
    df = pd.read_csv(filepath, sep="\t", index_col=0).set_index("Timestep")

    plot_CI(df)
    # plot_CI(df, cumulative=True)
