import os

from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from server.config import CONFIG


SERVER_ROOT = os.path.dirname(__file__)

app = FastAPI()
app.mount(
    "/static", StaticFiles(directory=os.path.join(SERVER_ROOT, "static")), name="static"
)

templates = Jinja2Templates(directory=os.path.join(SERVER_ROOT, "templates"))


@app.get("/")
async def model(request: Request) -> Response:
    """serve the main model visualization"""
    return templates.TemplateResponse("model.html", {"request": request})


@app.get("/case-map")
async def case_map(request: Request) -> Response:
    return templates.TemplateResponse("case-map.html", {"request": request},)


@app.get("/request-calculation")
async def request_calculation(request: Request) -> Response:
    """TODO: This view should process a form"""
    return templates.TemplateResponse(
        "request-calculation.html",
        {"request": request, "message": "Please provide data"},
    )


@app.get("/thanks")
async def result_calculations(request: Request) -> Response:

    return templates.TemplateResponse("thanks.html", {"request": request,},)


@app.get("/about")
async def about(request: Request) -> Response:
    return templates.TemplateResponse("about.html", {"request": request},)


@app.get("/status")
async def status():
    return {"app_version": CONFIG.APP_VERSION}

@app.get("/containment")
async def containment(request: Request) -> Response:
    return templates.TemplateResponse("containment.html", {"request": request},)
