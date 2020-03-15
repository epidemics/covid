import os

from datetime import date
import numpy as np
import pandas as pd

from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

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
    "Wuhan"
]

SERVER_ROOT = os.path.dirname(__file__)

app = FastAPI()
app.mount(
    "/static", StaticFiles(directory=os.path.join(SERVER_ROOT, "static")), name="static"
)

templates = Jinja2Templates(directory=os.path.join(SERVER_ROOT, "templates"))


class Place:
    def __init__(self, name):
        self.name = name


@app.get("/")
async def index(request: Request) -> Response:
    """TODO: this is the main hompage, should have a bubble map which should
    link ot the /model"""
    return templates.TemplateResponse("index.html", {"request": request},)


@app.get("/request-calculation")
async def request_calculation(request: Request) -> Response:
    """TODO: This view should process a form"""
    """MATI: Actually, I don't think we'll have anything to process here as the first page just has a START button"""

    # TODO: Use real data model here

    places = [Place(place) for place in PLACES]

    return templates.TemplateResponse("request-calculation.html", {"request": request, "message": "Please provide data", "places": places},)

@app.get("/model")
async def model(request: Request, city: str = "New York") -> Response:
    """TODO: this should serve the main model visualization"""
    # TODO: argument
    arguments = {"city": city} if city else {}
    return templates.TemplateResponse("model.html", {"request": request},)


@app.get("/request-event-evaluation")
async def request_event_evaluation(request: Request) -> Response:

    places = [Place(place) for place in PLACES]

    return templates.TemplateResponse(
        "request-event-evaluation.html",
        {"request": request, "message": "Please provide data", "places": places},
    )

@app.get("/result-calculations")
async def result_calculations(
    request: Request, datepicker: str, number: int, place: str
) -> Response:
    # TODO: Use real data model here
    class Place:
        def __init__(self, name):
            self.name = name
            self.population = 4000000
            self.gleamviz_predictions = pd.Series(  # From gleamviz
                np.logspace(2, 6, num=31),
                index=pd.date_range(start=date.today(), periods=31)
            )
    class Data:
        def __getitem__(self, name):
            return Place(name)
    data = Data()

    # The following is not a mock
    place_data = data[place]
    try:
        median = place_data.gleamviz_predictions.loc[datepicker]
        fraction = median / place_data.population
        probability = (1 - (1 - fraction) ** number) * 100  # in %
    except KeyError:
        probability = "unknown"

    return templates.TemplateResponse(
        "result-calculations.html", {"request": request, "probability": probability},
    )
