import os

from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.responses import RedirectResponse, Response
from fastapi.middleware.gzip import GZipMiddleware

from server.config import CONFIG


STATIC_URL = "https://storage.googleapis.com/static-covid/static/staging"
# STATIC_URL = "https://storage.googleapis.com/static-covid/static/production"
SERVER_ROOT = os.path.dirname(__file__)

app = FastAPI()
app.mount(
    "/static", StaticFiles(directory=os.path.join(SERVER_ROOT, "static")),
    name="static"
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

templates = Jinja2Templates(directory=os.path.join(SERVER_ROOT, "templates"))


@app.get("/")
async def model(request: Request) -> Response:
    """serve the main model visualization"""
    return templates.TemplateResponse(
        "model.html",
        {"request": request, "STATIC_URL": STATIC_URL}
    )


@app.get("/case-map")
async def case_map(request: Request) -> Response:
    return templates.TemplateResponse(
        "case-map.html",
        {"request": request, "STATIC_URL": STATIC_URL},
    )


@app.get("/request-calculation")
async def request_calculation(request: Request) -> Response:
    return templates.TemplateResponse(
        "request-calculation.html",
        {"request": request,
         "message": "Please provide data",
         "STATIC_URL": STATIC_URL},
    )


@app.get("/about")
async def about(request: Request) -> Response:
    return templates.TemplateResponse(
        "about.html",
        {"request": request, "STATIC_URL": STATIC_URL},
    )


@app.get("/status")
async def status():
    return {"app_version": CONFIG.APP_VERSION}


@app.get("/containment.", status_code=301, response_class=Response)
async def containment_with_dot():
    """Not sure why, but we had a lot of 404 in access log for this URL"""
    return RedirectResponse("/containment")


@app.get("/containment")
async def containment(request: Request) -> Response:
    return templates.TemplateResponse(
        "containment.html",
        {"request": request, "STATIC_URL": STATIC_URL},
    )
