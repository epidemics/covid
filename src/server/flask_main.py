

# from bokeh.embed import server_document
# from fastapi import FastAPI, Request, Response
# from fastapi.staticfiles import StaticFiles
# from fastapi.templating import Jinja2Templates


import os
import datetime
from flask import Flask, render_template, request, Request, Response, safe_join
from flask_wtf.csrf import CSRFProtect

#from .blueprints import resources, about, maps, objectives


templates_dir = os.path.join(os.path.abspath(os.curdir), "app", "templates")


def create_app(test_config=None):
    # create and configure the app
    app = Flask(
        __name__,
        static_folder='static',
        instance_relative_config=True,
    )
    app.config.from_mapping(
        SECRET_KEY='dev',
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # add CSRF token
    csrf = CSRFProtect(app)



# the URI must be accessible from the client's browser, it's not "proxied" via the server
#BOKEH_URI = os.getenv("BOKEH_URI", "http://0.0.0.0:5001").rstrip("/")
#SERVER_ROOT = os.path.dirname(__file__)



    @app.route("/")
    def index():
        """TODO: this is the main hompage, should have a bubble map which should
        link ot the /model"""
        bubble_map_script = None #server_document(os.path.join(BOKEH_URI, "app2"))
        return render_template(
            "index.html", **{"request": request, "plot": bubble_map_script},
        )


    @app.route("/request-calculation")
    def request_calculation():
        """TODO: This view should process a form"""
        return render_template("request-calculation.html", request=request)


    @app.route("/model")
    def model(city: str = "New York"):
        """TODO: this should serve the main model visualization,
    """
        #arguments = {"city": request.args.get("city")}
        arguments = {"city": city} if city else {}
        plot_script = None #server_document(f"{BOKEH_URI}/app1", arguments=arguments)
        return render_template(
            "model.html", **{"request": request, "plot": plot_script},
        )


    @app.route("/selections")
    def selection():
        return render_template(
            "selections.html", **{"request": request, "message": "Please provide data"},
        )


    @app.route("/result-calculations")
    def result_calculations(
       datepicker: str, number: int
    ):
        if number > 10:
            message = f"Oh no! {datepicker} and {number}?! You shouldn't do that"
        else:
            message = f"Ha, {datepicker} and {number}? Sure, go on!"
        return render_template(
            "result-calculations.html", message=message
        )

    return app



if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)