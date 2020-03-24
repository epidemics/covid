import os

import pandas as pd

from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from server.event_model import stress, excess

# from server.notion_connect import query_containment_measures
from server.config import CONFIG

PLACES = [
    "Africa",
    "Australia",
    "Belgium",
    "California",
    "China",
    "Dubai",
    "Egypt",
    "European Union",
    "France",
    "Germany",
    "Hong Kong",
    "Hubei",
    "India",
    "Indonesia",
    "Iran",
    "Italy",
    "Japan",
    "London",
    "Netherlands",
    "New York",
    "Oxford",
    "Russia",
    "San Francisco",
    "Singapore",
    "South Korea",
    "Spain",
    "Switzerland",
    "The Middle East",
    "United Kingdon",
    "United States of America",
    "Washington",
    "Wuhan",
]

CAPITALS = pd.read_csv(
    "https://raw.githubusercontent.com/icyrockcom/country-capitals/master/data/country-list.csv"
)

SERVER_ROOT = os.path.dirname(__file__)

app = FastAPI()
app.mount(
    "/static", StaticFiles(directory=os.path.join(SERVER_ROOT, "static")), name="static"
)

templates = Jinja2Templates(directory=os.path.join(SERVER_ROOT, "templates"))


# TODO: for testing purposes, make a fixture/mock
if CONFIG.ENABLE_NOTION:
    CONTAINMENT_MEAS = query_containment_measures()
else:
    CONTAINMENT_MEAS = None

LINES = pd.read_csv(
    "https://storage.googleapis.com/static-covid/static/line-data-v2.csv?cache_bump=2"
)

STARTDATE = pd.to_datetime("03/14/2020", format="%m/%d/%Y")

# TODO: Does it break anything to replace PLACES above?

PLACES_GV = {
    "Egypt": 9.7e7,
    "China": 1.4e9,
    "Hong Kong": 7.4e6,
    "India": 1.3e9,
    "Russia": 1.44e8,
    "South Korea": 5.1e7,
    "Singapore": 5.6e6,
    "Japan": 1.28e8,
    "Indonesia": 2.64e8,
    "Dubai": 3.3e6,
    "Iran": 8.1e7,
    "US": 3.3e8,
    "Australia": 2.5e7,
    "France": 6.7e7,
    "Italy": 6e7,
    "Germany": 8.3e7,
    "Spain": 4.7e7,
    "Netherlands": 1.7e7,
    "Switzerland": 8.5e6,
    "United Kingdom": 6.6e7,
    "Czech Republic": 1.1e7,
}


class Place:
    def __init__(self, name):
        self.name = name


@app.get("/")
async def model(request: Request) -> Response:
    """serve the main model visualization"""
    return templates.TemplateResponse("model.html", {"request": request})


@app.get("/case-map")
async def case_map(request: Request) -> Response:
    return templates.TemplateResponse("case-map.html", {"request": request},)


@app.get("/request-calculation")
async def request_calculation(request: Request) -> Response:
    """TODO: This view should process a form"""
    # TODO: Use real data model here

    places = [Place(place) for place in PLACES]

    return templates.TemplateResponse(
        "request-calculation.html",
        {"request": request, "message": "Please provide data", "places": places},
    )


@app.get("/thanks")
async def result_calculations(request: Request) -> Response:

    return templates.TemplateResponse("thanks.html", {"request": request,},)


@app.get("/about")
async def about(request: Request) -> Response:
    return templates.TemplateResponse("about.html", {"request": request},)


@app.get("/status")
async def status():
    return {"app_version": CONFIG.APP_VERSION}
