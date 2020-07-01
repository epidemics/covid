import { RequestHandler, Router } from "express";

import { Alert } from "../common/alert";

// identifiers for the pages
const COUNTRY_RT_ESTIMATES = "country-rt-estimates";
const CASE_MAP = "case-map";
const MITIGATION_CALCULATOR = "mitigation-calculator";
const MITIGATION_PAPER = "mitigation-paper";
const COUNTRY_SCENARIOS = "country-scenarios";
const GLOBAL_RT_MAP = "global-rt-map";
const SUBMIT_REQUEST = "submit-request";
const ABOUT = "about";
const MEASURES = "measures";
const DATASETS = "datasets";

// order of the pages as diplayed in the navigation bar
let navigation = [
  MITIGATION_CALCULATOR,
  COUNTRY_RT_ESTIMATES,
  GLOBAL_RT_MAP,
  COUNTRY_SCENARIOS,
  SUBMIT_REQUEST,
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

add(
  COUNTRY_RT_ESTIMATES,
  { path: "/country-rt-estimates", caption: "Country Rt Estimates" },
  (req, res) => {
    res.render("country-rt-estimates.html", { channel: res.locals.CHANNEL });
  }
);

add(CASE_MAP, { path: "/case-map", caption: "Case map" }, (req, res) =>
  res.render("case-map.html")
);

add(
  GLOBAL_RT_MAP,
  { path: "/global-rt-map", caption: "Global Rt Map" },
  (req, res) => res.render("global-rt-map.html")
);

add(MEASURES, { path: "/measures", caption: "Measures" }, (req, res) =>
  res.render("measures.html")
);

add(
  COUNTRY_SCENARIOS,
  { path: "/country-scenarios", caption: "Country Scenarios" },
  (req, res) => res.render("country-scenarios.html")
);

let handleMitigation = add(
  MITIGATION_CALCULATOR,
  { path: "/containment-calculator", caption: "Mitigation Calculator" },
  (req, res) => {
    res.render("containment.html");
  }
);

router.get("/calc", (req, res) => res.render("containment-calc.html"));

router.get("/request-calculation-submitted", (req, res) =>
  res.render("request-calculation-submitted.html", {
    message: "Form submitted",
  })
);

add(
  SUBMIT_REQUEST,
  { path: "/submit-request", caption: "Submit a request" },
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
