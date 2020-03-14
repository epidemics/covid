import os

from bokeh.embed import server_document
from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# the URI must be accessible from the client's browser, it's not "proxied" via the server
BOKEH_URI = os.getenv("BOKEH_URI", "http://0.0.0.0:5001").rstrip("/")
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
    bubble_map_script = server_document(f"{BOKEH_URI}/world_map", resources=None)
    return templates.TemplateResponse(
        "index.html", {"request": request, "plot": bubble_map_script},
    )


@app.get("/request-calculation")
async def request_calculation(request: Request) -> Response:
    """TODO: This view should process a form"""
    return templates.TemplateResponse("request-calculation.html", {"request": request},)


@app.get("/model")
async def model(request: Request, city: str = "New York") -> Response:
    """TODO: this should serve the main model visualization,
"""
    arguments = {"city": city} if city else {}
    plot_script = server_document(f"{BOKEH_URI}/app1", arguments=arguments, resources=None)
    return templates.TemplateResponse(
        "model.html", {"request": request, "plot": plot_script},
    )


@app.get("/selections")
async def selection(request: Request) -> Response:
    return templates.TemplateResponse(
        "selections.html", {"request": request, "message": "Please provide data"},
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
