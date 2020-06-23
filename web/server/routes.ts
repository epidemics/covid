import { RequestHandler, Router } from "express";

import { Alert } from "../common/alert";

// identifiers for the pages
const MITIGATION = "mitigation";
const MITIGATION_SCENARIOS = "mitigation-scenarios";
const GLOBAL_SITE = "global-site";
const ABOUT = "about";

// order of the pages as diplayed in the navigation bar
let navigation = [MITIGATION, MITIGATION_SCENARIOS, GLOBAL_SITE, ABOUT];

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

add(
  GLOBAL_SITE,
  { path: "http://epidemicforecasting.org/", caption: "Global site" },
  (req, res) => {}
);

export let navigation_bar = navigation.map((key) => pages[key]);
