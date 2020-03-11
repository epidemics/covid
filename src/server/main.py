import os

from bokeh.embed import server_document
from fastapi import FastAPI, Request, Response, Form
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# the URI must be accessible from the client's browser, it's not "proxied" via the server
BOKEH_URI = os.getenv("BOKEH_URI", "http://0.0.0.0:5001")

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


@app.get("/")
async def index(request: Request) -> Response:
    plot_script_1 = server_document(os.path.join(BOKEH_URI, "app1"))
    plot_script_2 = server_document(os.path.join(BOKEH_URI, "app2"))
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "plot_1": plot_script_1, "plot_2": plot_script_2},
    )


@app.get("/selections")
async def selection(
    request: Request, datepicker: str = None, number: str = None
) -> Response:
    if datepicker or number:
        message = f"{datepicker} and {number}"
    else:
        message = "No data yet"
    return templates.TemplateResponse(
        "selections.html", {"request": request, "message": message},
    )
