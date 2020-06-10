import { RequestHandler, Router } from "express";

import { Alert } from "../common/alert";

// identifiers for the pages
const MODELS = "models";
const CASE_MAP = "case-map";
const MITIGATION = "mitigation";
const MITIGATION_SCENARIOS = "mitigation-scenarios";
const MITIGATION_MAP = "mitigation-map";
const REQUEST_MODEL = "request-model";
const ABOUT = "about";
const MEASURES = "measures";
const DATASETS = "datasets";

// order of the pages as diplayed in the navigation bar
let navigation = [
  MODELS,
  MITIGATION_MAP,
  MITIGATION,
  MITIGATION_SCENARIOS,
  REQUEST_MODEL,
  DATASETS,
  ABOUT,
];

type NavBarEntry = { path: string; id: string; caption: string };

let pages: { [key: string]: NavBarEntry } = {};
function add(
  id: string,
  opts: { path: string; caption: string },
  handler_: RequestHandler
): RequestHandler {
  let { path, caption } = opts;
  pages[id] = { path, id, caption };

  let handler: RequestHandler = (req, res, next) => {
    res.locals.active_page = id;
    handler_(req, res, next);
  };

  router.get(path, handler);
  return handler;
}

export let router = Router();

let updatingModels: Alert = {
  id: "updatingAlert",
  dismissalDuration: { seconds: 1 },
  revision: "0",
  content: `Please note that the forecasts below are currently outdated and do not reflect the most recent data. We are updating our models and will post new predictions by Wednesday May 20.`,
};

add(MODELS, { path: "/models", caption: "Models" }, (req, res) => {
  res.render("model.html", { channel: res.locals.CHANNEL });
});

add(CASE_MAP, { path: "/case-map", caption: "Case map" }, (req, res) =>
  res.render("case-map.html")
);

add(
  MITIGATION_MAP,
  { path: "/mitigation-map", caption: "Mitigation map" },
  (req, res) => res.render("mitigation-map.html")
);

add(MEASURES, { path: "/measures", caption: "Measures" }, (req, res) =>
  res.render("measures.html")
);

add(
  MITIGATION_SCENARIOS,
  { path: "/mitigation-scenarios", caption: "Mitigation scenarios" },
  (req, res) => res.render("mitigation-scenarios.html")
);

let handleMitigation = add(
  MITIGATION,
  { path: "/containment", caption: "Mitigation" },
  (req, res) => {
    res.render("containment.html");
  }
);

router.get("/request-calculation-submitted", (req, res) =>
  res.render("request-calculation-submitted.html", {
    message: "Form submitted",
  })
);

add(
  REQUEST_MODEL,
  { path: "/request-calculation", caption: "Request a model" },
  (req, res) =>
    res.render("request-calculation.html", {
      message: "Please provide data",
    })
);

add(DATASETS, { path: "/datasets", caption: "Datasets" }, (req, res) =>
  res.render("datasets.html")
);

add(ABOUT, { path: "/about", caption: "About" }, (req, res) =>
  res.render("about.html")
);

router.get("/about-submitted", (req, res) =>
  res.render("about-submitted.html")
);

// Not sure why, but we had a lot of 404 in access log for this URL
router.get("/containment.", (req, res) => res.redirect("/containment"));

router.get("/", (req, res, next) => {
  handleMitigation(req, res, next);
});

export let navigation_bar = navigation.map((key) => pages[key]);
