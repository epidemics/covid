import pandas as pd
from bokeh.models import Band, ColumnDataSource
from bokeh.plotting import figure, output_file, show

DATA_FOLDER = "data/data_fixed"


def plot_CI(df: pd.DataFrame, title: str = None, cumulative: bool = False):
    x_col = "Timestep"
    y_col = "Median"
    lower_col = "Lower 95%CI"
    upper_col = "Upper 95%CI"

    if cumulative:
        cum = "Cumulative "
        y_col = cum + y_col
        lower_col = cum + lower_col
        upper_col = cum + upper_col

    if "Timestep" not in df:
        df = df.reset_index()

    source = ColumnDataSource(df)

    TOOLS = "pan,wheel_zoom,box_zoom,reset,save"
    p = figure(tools=TOOLS)

    p.scatter(x=x_col, y=y_col, line_color=None, fill_alpha=0.3, size=5, source=source)

    band = Band(
        base=x_col,
        lower=lower_col,
        upper=upper_col,
        source=source,
        level="underlay",
        fill_alpha=1.0,
        line_width=1,
        line_color="black",
    )
    p.add_layout(band)

    if title is not None:
        p.title.text = title

    p.xgrid[0].grid_line_color = None
    p.ygrid[0].grid_line_alpha = 0.5

    p.xaxis.axis_label = "Days"
    p.yaxis.axis_label = "Median + 95%CI"

    show(p)


if __name__ == "__main__":
    # select some random file
    filepath = DATA_FOLDER + "/cities/3-0.tsv"
    df = pd.read_csv(filepath, sep="\t", index_col=0).set_index("Timestep")

    plot_CI(df)
    # plot_CI(df, cumulative=True)
