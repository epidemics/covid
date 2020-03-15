import os

from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

SERVER_ROOT = os.path.dirname(__file__)

app = FastAPI()
app.mount(
    "/static", StaticFiles(directory=os.path.join(SERVER_ROOT, "static")), name="static"
)

templates = Jinja2Templates(directory=os.path.join(SERVER_ROOT, "templates"))


@app.get("/")
async def index(request: Request) -> Response:
    """TODO: this is the main hompage, should have a bubble map which should
    link ot the /model"""
    bubble_map_script = server_document(
        f"{BOKEH_URI}/world_map", resources=None)
    return templates.TemplateResponse(
        "index.html", {"request": request, "plot": bubble_map_script},
    )


@app.get("/request-calculation")
async def request_calculation(request: Request) -> Response:
    """TODO: This view should process a form"""
    return templates.TemplateResponse("request-calculation.html", {"request": request},)


@app.get("/model")
async def model(request: Request, city: str = "New York") -> Response:
    """TODO: this should serve the main model visualization"""
    # TODO: argument
    arguments = {"city": city} if city else {}
    return templates.TemplateResponse("model.html", {"request": request},)


@app.get("/request-event-evaluation")
async def selection(request: Request) -> Response:
    return templates.TemplateResponse(
        "request-event-evaluation.html", {"request": request,
                                          "message": "Please provide data"},
    )


@app.get("/result-event-evaluation")
async def selection(request: Request) -> Response:
    return templates.TemplateResponse(
        "result-event-evaluation.html", {"request": request,
                                         "message": "Please provide data"},
    )


@app.get("/result-calculations")
async def result_calculations(
    request: Request, datepicker: str, number: int
) -> Response:
    if number > 10:
        message = f"Oh no! {datepicker} and {number}?! You shouldn't do that"
    else:
        message = f"Ha, {datepicker} and {number}? Sure, go on!"
    return templates.TemplateResponse(
        "result-calculations.html", {"request": request, "message": message},
    )
