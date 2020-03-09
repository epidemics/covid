import os

from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from bokeh.embed import server_document

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
        "index.html", {"request": request, "plot_1": plot_script_1, "plot_2": plot_script_2}
    )
