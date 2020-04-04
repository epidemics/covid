import {env} from 'process';
import {Express, Router} from 'express';

const APP_VERSION = env.npm_package_version

type NavBarEntry = {path: string, id: string, caption: string};

export let navigation_bar: Array<NavBarEntry> = [
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

export let router = Router();

// serve the main model visualization
router.get("/", (req, res) => 
  res.render("model.html")
);

router.get("/case-map", (req, res) => 
  res.render("case-map.html")
);

router.get("/request-calculation", (req, res) => 
  res.render("request-calculation.html", {message: "Please provide data"})
);

router.get("/about", (req, res) => 
  res.render("about.html")
);

router.get("/status", (req, res) => {
  return {"app_version": APP_VERSION}
});

// Not sure why, but we had a lot of 404 in access log for this URL
router.get("/containment.", (req, res) =>
  res.redirect("/containment")
);

router.get("/containment", (req, res) => 
  res.render("containment.html")
);