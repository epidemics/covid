import os

from datetime import date
import numpy as np
import pandas as pd
import math

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
    number: str = "1-10",
    datepicker: str = "02/02/2017",
    control_strength: float = 0.5,
    length: str = "hours",
    size: str = "inbetween"
) -> Response:
    # TODO - implement the calculations based on parameters from the request-event-evaluation
    # TODO: Use real data model here, also use the real values from the forms, parameters are ignored
    # TODO: add control strength parameter
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

    num = {"1-10":5,
           "10-100":50,
           "100-1000":500,
           "1000+":5000}[number]

    # Wild stab at transmission probabilities
    transmission = {'hours':0.02,'day':0.05,'days':0.08}
    effective_contacts = {'little':3/2, 'inbetween':5/3, 'lot':2}

    stress_fun = {1e-6:1.5,
                  1e-5:1.5,
                  1e-4:1.5,
                  1e-3:2,
                  1e-2:17}

    ai_fun = {(1e-6,0.7):0.4,
              (1e-6,0.5):34.5,
              (1e-6,0.3):1.2,
              (1e-5,0.7):0.4,
              (1e-5,0.5):9.5,
              (1e-5,0.3):1.2,
              (1e-4,0.7):0.4,
              (1e-4,0.5):2.6,
              (1e-4,0.3):1.2,
              (1e-3,0.7):0.6,
              (1e-3,0.5):3.2,
              (1e-3,0.3):3.9,
              (1e-2,0.7):0.6,
              (1e-2,0.5):2.5,
              (1e-2,0.3):3.4}


    # The following is not a mock, but until data are fixed, it is irrelevant
    place_data = data[place]
        

    try:
        median = place_data.gleamviz_predictions.loc[datepicker]
        fraction = median / place_data.population
        probability = (1 - (1 - fraction) ** num) * 100  # in %
        fraction_oom = 10**math.floor(math.log(fraction,10))
        expected_infections = transmission[length]*fraction*num**effective_contacts[size]
        sorder_infections = expected_infections*2.5
    except KeyError:
        probability = "unknown"
        fraction_oom = 0
        expected_infections = "unknown"
        sorder_infections = "unknown"

    if place_data.gleamviz_predictions.max()*0.15 < place_data.population*0.002:
        excess_hospital_load = 'Not applicable'
    else:
        try:
            excess_hospital_load = stress_fun[fraction_oom]
        except KeyError:
            excess_hospital_load = 'unknown'

    try:
        excess_infections = ai_fun[(fraction_oom,control_strength)]
    except KeyError:
        excess_infections = "unknown"

    return templates.TemplateResponse(
        "result-event-evaluation.html",
        {
            "request": request,
            "datepicker": datepicker,
            "number": number,
            "place": place,
            "probability": probability,
            "expected_infections":expected_infections,
            "excess_infections":excess_infections,
            "excess_hospital_load":excess_hospital_load,
            "sorder_infections":sorder_infections,
            "hund_events_infections":100*excess_infections*expected_infections,
            "hund_events_load":100*excess_hospital_load
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
