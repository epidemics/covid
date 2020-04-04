import * as express from "express";
import * as path from "path";
import * as compression from "compression";
import * as process from "process"
import * as nunjucks from "nunjucks";

const STATIC_URL = process.env.STATIC_URL || "/static";
const APP_VERSION = process.env.npm_package_version

let app = express()

app.use(compression())

app.use(
  "/static",
  express.static(path.join(__dirname, '../static'))
)

nunjucks.configure(path.join(__dirname, 'templates'), {
  autoescape: true,
  express: app
});

type NavBarEntry = {path: string, id: string, caption: string};

const navigation_bar: Array<NavBarEntry> = [
  {
    path: '/', 
    id: 'models', 
    caption: 'Models'
  }, {
    path: '/case-map', 
    id: 'case-map', 
    caption: 'Case map'
  },  {
    path: '/containment', 
    id: 'mitigation', 
    caption: 'Mitigation'
  },  {
    path: '/request-calculation', 
    id: 'request-model', 
    caption: 'Request model'
  },  {
    path: '/about', 
    id: 'about', 
    caption: 'About'
  } 
]

function getContext(request: express.Request, other?: {[key: string]: any}){
  if(!other) other = {}

  return {
    request, 
    STATIC_URL, 
    navigation_bar,
    ...other
  }
}

// serve the main model visualization
app.get("/", (req, res) => {
  return res.render("model.html", getContext(req))
});

app.get("/case-map", (req, res) => {
  return res.render("case-map.html", getContext(req))
});

app.get("/request-calculation", (req, res) => {
  return res.render(
    "request-calculation.html", getContext(req, {message: "Please provide data"}),
  )
});

app.get("/about", (req, res) => {
  return res.render("about.html", getContext(req))
});

app.get("/status", (req, res) => {
  return {"app_version": APP_VERSION}
});

// Not sure why, but we had a lot of 404 in access log for this URL
app.get("/containment.", (req, res) => {
  return res.redirect("/containment");
});

app.get("/containment", (req, res) => {
  return res.render("containment.html", getContext(req))
});

app.listen(8000, "0.0.0.0");