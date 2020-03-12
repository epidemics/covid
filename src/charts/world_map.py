from collections import namedtuple
from numbers import Real
from typing import Union

import numpy as np
import pandas as pd
from bokeh.models import HoverTool
from bokeh.plotting import figure, Figure, output_file, show
from bokeh.tile_providers import Vendors, get_provider

# For typing hints
NumberLike = Union[Real, pd.Series, np.ndarray]
WebMercatorCoords = namedtuple("WebMercatorCoords", "x y")


def web_mercator(longitude: NumberLike, latitude: NumberLike) -> WebMercatorCoords:
    """Convert geo-coordinates to be compatible with CARTODBPOSITRON.
    
    :param longitude: Longitude(s) in degrees
    :param latitude: Latitude(s) in degress
    """
    # Insipiration taken from https://en.wikipedia.org/wiki/Web_Mercator_projection
    # (but direct copying of equations does not work)
    # The coords go from -2e7 to 2e7
    scale_x = 4e7 / 360

    # The latitude is limited to ~85 degrees to form a square
    limit_lat = 2 * np.arctan(np.exp(np.pi)) - np.pi / 2
    scale_y = 2e7 / np.log(np.tan(np.pi / 4 + limit_lat / 2))

    # x: Easy
    x = scale_x * longitude

    # y: More complicated due to vertical prolongation
    lat_rad = np.pi / 180 * latitude
    y = scale_y * (np.log(np.tan(np.pi / 4 + lat_rad / 2)))

    return WebMercatorCoords(x, y)


def plot(data: pd.DataFrame, height=512, width=1024) -> Figure:
    # Ideally, the height / width ratio should be 1:2 (as we remove polar areas)
    web_mercator_coords = web_mercator(data["long"], data["lat"])
    data = data.assign(
        web_mercator_x=web_mercator_coords.x,
        web_mercator_y=web_mercator_coords.y,
        radius=np.log(data["cases"]) * 100000,
    )

    tile_provider = get_provider(Vendors.CARTODBPOSITRON)

    tools = "hover,box_zoom,pan,save,reset,wheel_zoom"

    p = figure(
        height=height,
        width=width,
        x_range=(-180, 179),
        y_range=(-1e7, 1e7),
        x_axis_type="mercator",
        y_axis_type="mercator",
        tools=tools,
    )
    p.add_tile(tile_provider)
    p.circle(
        x="web_mercator_x", y="web_mercator_y", radius="radius", alpha=0.5, source=data
    )

    hover = p.select(dict(type=HoverTool))
    hover.tooltips = [
        ("Place", "@name"),
        ("Cases", "@cases"),
    ]
    hover.mode = "mouse"

    return p


EXAMPLE_DATA = pd.DataFrame(
    [("Prague", 50, 14.5, 50), ("Wuhan", 30.5, 114.25, 50000)],
    columns=["name", "lat", "long", "cases"],
)

if __name__ == "__main__":
    output_file("world_bubble_map.html", mode="inline")
    p = plot(EXAMPLE_DATA)
    show(p)
