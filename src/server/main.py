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
    "Wuhan",
]

SERVER_ROOT = os.path.dirname(__file__)

app = FastAPI()
app.mount(
    "/static", StaticFiles(directory=os.path.join(SERVER_ROOT, "static")), name="static"
)

templates = Jinja2Templates(directory=os.path.join(SERVER_ROOT, "templates"))

df = pd.read_csv("src/server/static/data/covid-containment-measures.csv")
df = df.loc[
    df.Country.notna(),
    [
        "Country",
        "Description of measure implemented",
        "Keywords",
        "Source",
        "Date Start",
    ],
]
df["date"] = pd.to_datetime(
    df["Date Start"].str.upper(), format="%b %d, %Y", yearfirst=False
)
del df["Date Start"]
CONTAINMENT_MEAS = df


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
    # TODO: Use real data model here

    places = [Place(place) for place in PLACES]

    return templates.TemplateResponse(
        "request-calculation.html",
        {"request": request, "message": "Please provide data", "places": places},
    )


@app.get("/model")
async def model(request: Request, country: str = "USA") -> Response:
    """TODO: this should serve the main model visualization"""
    arguments = {"country": country} if country else {}
    # TODO: parse the argument for the plot
    return templates.TemplateResponse("model.html", {"request": request})


@app.get("/request-event-evaluation")
async def request_event_evaluation(request: Request) -> Response:

    places = [Place(place) for place in PLACES]

    return templates.TemplateResponse(
        "request-event-evaluation.html",
        {"request": request, "message": "Please provide data", "places": places},
    )


@app.get("/result-event-evaluation")
async def result_event_evaluation(
    request: Request,
    place: str = "USA",
    number: int = 10,
    datepicker: str = "02/02/2017",
) -> Response:
    # TODO - implement the calculations based on parameters from the request-event-evaluation
    # TODO: Use real data model here, also use the real values from the forms, parameters are ignored
    class Place:
        def __init__(self, name):
            self.name = name
            self.population = 4000000
            self.gleamviz_predictions = pd.Series(  # From gleamviz
                np.logspace(2, 6, num=31),
                index=pd.date_range(start=date.today(), periods=31),
            )

    class Data:
        def __getitem__(self, name):
            return Place(name)

    data = Data()

    # The following is not a mock, but until data are fixed, it is irrelevant
    place_data = data[place]
    try:
        median = place_data.gleamviz_predictions.loc[datepicker]
        fraction = median / place_data.population
        probability = (1 - (1 - fraction) ** number) * 100  # in %
    except KeyError:
        probability = "unknown"
    return templates.TemplateResponse(
        "result-event-evaluation.html",
        {
            "request": request,
            "datepicker": datepicker,
            "number": number,
            "place": place,
            "probability": probability,
        },
    )


@app.get("/thanks")
async def result_calculations(request: Request) -> Response:

    return templates.TemplateResponse("thanks.html", {"request": request,},)


@app.get("/contact")
async def request_calculation(request: Request) -> Response:
    return templates.TemplateResponse(
        "contact-form.html", {"request": request, "message": ""},
    )
