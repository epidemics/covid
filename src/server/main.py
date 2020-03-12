import os

from bokeh.embed import server_document
from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# the URI must be accessible from the client's browser, it's not "proxied" via the server
BOKEH_URI = os.getenv("BOKEH_URI", "http://0.0.0.0:5001")
SERVER_ROOT = os.path.dirname(__file__)

app = FastAPI()
app.mount(
    "/static", StaticFiles(directory=os.path.join(SERVER_ROOT, "static")), name="static"
)

templates = Jinja2Templates(directory=os.path.join(SERVER_ROOT, "templates"))


@app.get("/")
async def index(request: Request) -> Response:
    plot_script_1 = server_document(os.path.join(BOKEH_URI, "app1"))
    plot_script_2 = server_document(os.path.join(BOKEH_URI, "app2"))
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "plot_1": plot_script_1, "plot_2": plot_script_2},
    )


@app.get("/selections")
async def selection(request: Request) -> Response:
    return templates.TemplateResponse(
        "selections.html", {"request": request, "message": "Please provide data"},
    )


@app.get("/result-calculations")
async def result_calculations(
    request: Request, datepicker: str = None, number: int = None
) -> Response:
    if number > 10:
        message = f"Oh no! {datepicker} and {number}?! You shouldn't do that"
    else:
        message = f"Ha, {datepicker} and {number}? Sure, go on!"
    return templates.TemplateResponse(
        "result-calculations.html", {"request": request, "message": message},
    )
