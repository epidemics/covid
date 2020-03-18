import os

from datetime import date
import numpy as np
import pandas as pd

from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from server.event_model import stress, excess
from server.notion_connect import query_containment_measures

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


CONTAINMENT_MEAS = query_containment_measures()

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

LINES["Country"].unique()


class Place:
    def __init__(self, name):
        self.name = name


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


@app.get("/")
async def model(request: Request, country: str = "USA") -> Response:
    """serve the main model visualization"""
    arguments = {"country": country} if country else {}

    # TODO: parse the argument for the plot
    return templates.TemplateResponse("model.html", {"request": request})


@app.get("/request-event-evaluation")
async def request_event_evaluation(request: Request) -> Response:

    places = [Place(place) for place in PLACES_GV.keys()]

    return templates.TemplateResponse(
        "request-event-evaluation.html",
        {"request": request, "message": "Please provide data", "places": places},
    )


@app.get("/result-event-evaluation")
async def result_event_evaluation(
    request: Request,
    place: str,
    datepicker: str,
    length: str,
    contactSize: str,
    controlStrength: str,
    peopleCount: str,
) -> Response:

    strength = {"none": 0, "weak": 0.3, "moderate": 0.4, "strong": 0.5}[controlStrength]
    num = {"1-10": 5, "10-100": 50, "100-1000": 500, "1000+": 5000}[peopleCount]

    # Wild stab at transmission probabilities
    transmission = {"hours": 0.02, "day": 0.05, "days": 0.08}[length]
    effectiveContacts = {"little": 3 / 2, "inbetween": 5 / 3, "lot": 2}[contactSize]

    class Place:
        def __init__(self, name):
            self.name = name
            self.population = PLACES_GV[name]
            cols = [i for i in LINES.columns if i.startswith("Cumulative")]
            timesteps = (
                LINES[
                    (LINES["Country"] == name) & (LINES["Mitigation"] == strength)
                ].set_index("Timestep")[cols]
            ) / 1000
            self.gleamviz_predictions = timesteps.mean(axis=1)
            self.gleamviz_upper = timesteps.max(axis=1)
            self.gleamviz_lower = timesteps.min(axis=1)

    class Data:
        def __getitem__(self, name):
            return Place(name)

    data = Data()

    event_index = (pd.to_datetime(datepicker, format="%m/%d/%Y") - STARTDATE).days

    dispControlStrength = controlStrength.replace("none", "no")

    place_data = data[place]

    try:
        medianFraction = place_data.gleamviz_predictions.loc[event_index]
        minFraction = place_data.gleamviz_lower.loc[event_index]
        maxFraction = place_data.gleamviz_upper.loc[event_index]
        minCases, maxCases, medianCases = tuple(
            int(place_data.population * i)
            for i in (minFraction, maxFraction, medianFraction)
        )
        minProbability = (1 - (1 - minFraction) ** num) * 100  # in %
        maxProbability = (1 - (1 - maxFraction) ** num) * 100
        # Not currently displayed
        # minExpected = (
        #     transmission * minFraction * num ** effectiveContacts
        # )
        # maxExpected = (
        #   transmission * maxFraction * num ** effectiveContacts
        # )
    except KeyError:
        minProbability = -99999
        maxProbability = -99999
        medianCases = -99999
        fraction = -99999
        minCases = -99999
        maxCases = -99999
        minExpected = -99999
        maxExpected = -99999
        minFraction = 0.5  # TODO: MOCKED! It was undefined in some cases
        maxFraction = 0.5  # TODO: MOCKED! It was undefined in some cases

    if strength >= 0.5:
        minStress = "Not applicable"
        maxStress = "Not applicable"
    else:
        stresses = [
            stress(fraction * a, strength + b)
            for a in [10, 1, 0.1]
            for b in [0, 0.1, -0.1]
            for fraction in [minFraction, maxFraction]
        ]
        minStress = min(stresses)
        maxStress = max(stresses)

    excesses = [
        excess(fraction * a, strength + b)
        for a in [10, 1, 0.1]
        for b in [0, 0.1, -0.1]
        for fraction in [minFraction, maxFraction]
    ]
    minExcess = min(excesses)
    maxExcess = max(excesses)

    return templates.TemplateResponse(
        "result-event-evaluation.html",
        {
            "request": request,
            "controlStrength": dispControlStrength,
            "datepicker": datepicker,
            "peopleCount": num,
            "place": place,
            "minProbability": minProbability,
            "maxProbability": maxProbability,
            # "minExpected": minExpected,
            # "maxExpected": maxExpected,
            "minExcess": minExcess,
            "maxExcess": maxExcess,
            "minStress": minStress,
            "maxStress": maxStress,
            "medianCases": medianCases,
            "minCases": minCases,
            "maxCases": maxCases,
            "minPrevalence": minFraction * 100,
            "eventDate": datepicker,
            "startDate": STARTDATE,
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
    capital = country
    country = country.title()
    if country not in CONTAINMENT_MEAS.country.unique():
        country = CAPITALS.loc[CAPITALS.capital == capital, ["country"]]

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
        measures = [
            val for _, val in sel.fillna("Unknown").to_dict(orient="index").items()
        ]
    else:
        measures = None
    return measures
