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

CAPITALS = pd.read_csv(
    "https://raw.githubusercontent.com/icyrockcom/country-capitals/master/data/country-list.csv"
)

SERVER_ROOT = os.path.dirname(__file__)

app = FastAPI()
app.mount(
    "/static", StaticFiles(directory=os.path.join(SERVER_ROOT, "static")), name="static"
)

templates = Jinja2Templates(directory=os.path.join(SERVER_ROOT, "templates"))

df = pd.read_csv(
    os.path.join(SERVER_ROOT, "static", "data", "covid-containment-measures.csv")
)
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

LINES = pd.read_csv('https://storage.googleapis.com/static-covid/static/line-data-v2.csv?cache_bump=2')

STARTDATE = pd.to_datetime('03/14/2020',format='%m/%d/%Y')

# In case I break anything by replacing the previous places

PLACES_GV = LINES['Country'].unique()

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
    """serve the main model visualization"""
    arguments = {"country": country} if country else {}

    # TODO: parse the argument for the plot
    return templates.TemplateResponse("model.html", {"request": request})


@app.get("/request-event-evaluation")
async def request_event_evaluation(request: Request) -> Response:

    places = [Place(place) for place in PLACES_GV]

    return templates.TemplateResponse(
        "request-event-evaluation.html",
        {"request": request, "message": "Please provide data", "places": places},
    )


@app.get("/result-event-evaluation")
async def result_event_evaluation(
    request: Request,
    place: str = "US",
    number: str = "1-10",
    datepicker: str = "02/02/2017",
    control_strength: str = 'moderate',
    length: str = "hours",
    size: str = "inbetween"
) -> Response:

    strength = {'none':0,
                'weak':0.3,
                'moderate':0.4,
                'strong':0.5}[control_strength]
    num = {"1-10":5,
           "10-100":50,
           "100-1000":500,
           "1000+":5000}[number]

    class Place:
        def __init__(self, name):
            self.name = name
            self.population = 33e7
            cols = [i for i in LINES.columns if i.startswith('Cumulative')]
            print(name,strength)
            self.gleamviz_predictions = self.population*LINES[(LINES['Country']==name) & (LINES['Mitigation']==strength)].set_index('Timestep')[cols].mean(axis=1)/1000

    class Data:
        def __getitem__(self, name):
            return Place(name)

    data = Data()

    event_index = (pd.to_datetime(datepicker,format='%m/%d/%Y') - STARTDATE).days



    # Wild stab at transmission probabilities
    transmission = {'hours':0.02,'day':0.05,'days':0.1}
    effective_contacts = {'little':3/2, 'inbetween':5/3, 'lot':2}

    stress_fun = {(1e-6,0.3):1.5,
                  (1e-6,0.4):2.4,
                  (1e-6,0):0.8,
                  (1e-5,0.4):2.4,
                  (1e-5,0.3):1.5,
                  (1e-5,0):.9,
                  (1e-4,0.4):2.3,
                  (1e-4,0.3):1.5,
                  (1e-4,0):0.8,
                  (1e-3,0.4):3.9,
                  (1e-3,0.3):2.2,
                  (1e-3,0):0.9,
                  (1e-2,0.4):3.8,
                  (1e-2,0.3):2.2,
                  (1e-2,0):0.8,
                  (1e-1,0.4):1,
                  (1e-1,0.3):0.7,
                  (1e-1,0):0.2}

    ai_fun = {(1e-6,0):0.2,
              (1e-6,0.3):0.4,
              (1e-6,0.4):0.7,
              (1e-6,0.5):34.5,
              (1e-5,0):0.2,
              (1e-5,0.3):0.4,
              (1e-5,0.4):0.7,
              (1e-5,0.5):9.5,
              (1e-4,0):0.2,
              (1e-4,0.3):0.4,
              (1e-4,0.4):0.7,
              (1e-4,0.5):2.6,
              (1e-3,0):0.2,
              (1e-3,0.3):0.6,
              (1e-3,0.4):1.1,
              (1e-3,0.5):3.2,
              (1e-2,0):0.6,
              (1e-2,0.3):0.6,
              (1e-2,0.4):1.1,
              (1e-2,0.5):2.5,
              (1e-1,0):0.2,
              (1e-1,0.3):0.5,
              (1e-1,0.4):0.9,
              (1e-1,0.5):1.3}

    message = "By default we suggest cancelling unless the event is critical. \
                    Our model currently is not reliable for predicting the long run effects \
                    of your decisions if your country implements strong containment measures, \
                    and these could be significant. We expect many countries will implement strong \
                    containment measures and many have already."

    place_data = data[place]

    try:
        median = place_data.gleamviz_predictions.loc[event_index]
        fraction = median / place_data.population
        probability = (1 - (1 - fraction) ** num) * 100  # in %
        fraction_oom = 10**math.floor(math.log(fraction,10))
        expected_infections = transmission[length]*fraction*num**effective_contacts[size]
        sorder_infections = expected_infections*2.5
    except KeyError:
        median = -1
        fraction = "unknown"
        probability = "unknown"
        fraction_oom = 0
        expected_infections = "unknown"
        sorder_infections = "unknown"

    if place_data.gleamviz_predictions.max()*0.15 < place_data.population*0.002:
        excess_hospital_load = 'Not applicable'
    else:
        try:
            excess_hospital_load = stress_fun[(fraction_oom,strength)]
        except KeyError:
            excess_hospital_load = 'unknown'

    try:
        excess_infections = ai_fun[(fraction_oom,strength)]
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
            "medianCases": median,
            "numberPeople": num,
            "prevalence": fraction*100,
            "message":message
        },
    )


@app.get("/thanks")
async def result_calculations(request: Request) -> Response:

    return templates.TemplateResponse("thanks.html", {"request": request,},)


@app.get("/about")
async def about(request: Request) -> Response:
    return templates.TemplateResponse("about.html", {"request": request},)


@app.get("/get_containment_measures")
async def containment_measures(request: Request, country: str = "China") -> Response:
    """serve the main model visualization"""

    if country not in CONTAINMENT_MEAS.Country.unique():
        country = CAPITALS.loc[CAPITALS.capital == country, ["country"]]

        if country.empty is True:
            country = None
        else:
            country = country.values[0][0]

    if country is not None:
        sel = CONTAINMENT_MEAS.loc[
            CONTAINMENT_MEAS.Country == country,
            ["date", "Description of measure implemented", "Source"],
        ].sort_values(by="date", ascending=False)
        sel["date"] = sel.date.dt.strftime("%Y-%m-%d")
        args = sel.to_dict()
    else:
        args = None

    return args
