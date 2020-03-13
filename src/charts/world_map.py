import io
from collections import namedtuple
from numbers import Real
from typing import Union

import numpy as np
import pandas as pd
from bokeh.io import curdoc
from bokeh.models import Circle, HoverTool, OpenURL, TapTool
from bokeh.plotting import figure, Figure, show
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
    web_mercator_coords = web_mercator(data["Longitude"], data["Latitude"])
    data = data.assign(
        web_mercator_x=web_mercator_coords.x,
        web_mercator_y=web_mercator_coords.y,
        # radius=np.log(data["cases"]) * 100000,
    )

    tile_provider = get_provider(Vendors.CARTODBPOSITRON)

    tools = "hover,box_zoom,pan,save,reset,wheel_zoom,tap"

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

    circle_options = dict(fill_alpha=.5, fill_color="firebrick", line_color="black")
    circle_renderer = p.circle(
        x="web_mercator_x", y="web_mercator_y", radius=200000, source=data, **circle_options
    )

    selected_circle = Circle(**circle_options)
    nonselected_circle = Circle(**circle_options)

    circle_renderer.selection_glyph = selected_circle
    circle_renderer.nonselection_glyph = nonselected_circle

    tooltips = """
    <div>
        <div style="font-weight: bold">@City, @Country</div>
        <div>Click to show plots</div>
    </div>
    """

    hover = p.select(dict(type=HoverTool))
    hover.tooltips = tooltips
    hover.mode = "mouse"

    # Based on https://stackoverflow.com/questions/41511274/turn-bokeh-glyph-into-a-link
    url = "https://en.wikipedia.org/wiki/@City"
    taptool = p.select(type=TapTool)
    taptool.callback = OpenURL(url=url, same_tab=True)

    return p


POC_SOURCE = """City Code,City,Country Code,Country,Latitude,Longitude
420,Beijing,39,China,39.90,116.41
1099,Delhi,98,India,28.70,77.10
2518,New York,218,US,40.71,-74.01
1990,Rio de Janeiro,29,Brazil,-22.91,-43.17
3106,Tokyo,108,Japan,35.69,139.69
1890,Moscow,178,Russia,55.76,37.62
1426,Abuja,154,Nigeria,9.07,7.48
742,Berlin,56,Germany,52.52,13.41
791,London,75,UK,51.51,-0.12
1024,Mexico City,133,Mexico,19.43,-99.13
1535,Paris,71,France,48.86,2.35
1314,Jakarta,96,Indonesia,6.2,106.82
1129,Ho Chi Minh City,224,Vietnam
1758,Istanbul,211,Turkey,41.01,28.96
596,Manila,166,Philippines,14.60,120.98
2803,Seoul,115,South Korea,37.57,126.97
3099,Rome,104,Italy,41.88,12.5
2966,Tehran,100,Iran,35.69,51.39
2874,Madrid,65,Spain,40.38,-3.72
108,Islamabad,163,Pakistan,33.69,73.06
2682,Toronto,35,Canada,43.74,-79.37
52,Cairo,63,Egypt,30.03,31.23
3205,Buenos Aires,7,Argentina,-34.60,-58.38
538,Bangkok,204,Thailand,13.75,100.49
635,Cape Town,229,South Africa,-33.93,18.42
2852,Warsaw,169,Poland,52.23,21.02
1377,Bogota,45,Colombia,4.71,-74.07
69,Dhaka,19,Bangladesh,23.76,90.39
1738,Nairobi,110,Kenya,-1.29,36.82
182,Kuala Lumpur,148,Malaysia,3.15,101.69
256,Riyadh,180,Saudi Arabia,24.63,46.72
1612,Sydney,11,Australia,-33.87,151.21
820,Rabat,128,Morocco,34.02,-6.84
2796,Kyiv,216,Ukraine,50.45,30.52
1714,Caracas,221,Venezuela,10.48,-66.90
837,Amsterdam,157,Netherlands,52.37,4.9
2841,Tashkent,219,Uzbekistan,41.3,69.27
296,Santiago,38,Chile,-33.45,-70.67
1216,Lima,165,Peru,-12.05,-77.03
146,Bucharest,177,Romania,44.43,26.10"""

POC_STREAM = io.StringIO(POC_SOURCE)
POC_DATA = pd.read_csv(POC_STREAM)

p = plot(POC_DATA)
curdoc().add_root(p)
