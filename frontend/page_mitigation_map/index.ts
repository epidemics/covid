import * as Plotly from "plotly.js";
import * as d3 from "d3";
import { isTouchDevice } from "../helpers";
import { makeDataStore } from "../ds";

const MAP_ID = "mitigation_mapid";
const ISO_KEY = "iso_a3";

function makeMitigationMap(caseMap: HTMLElement, betaData: any, geoData: any) {
  function value_to_labels(v: number) {
    return v.toString();
  }

  function get_tick_values(zmax: number, step: number) {
    let res: Array<number> = [];
    let i = 0;
    while (i <= zmax) {
      res.push(i);
      i = i + step;
    }
    return res;
  }

  let info_by_iso3: {
    [key: string]: { name: string; code: string; z: number };
  } = {};
  let _zmax = 3.7; // we want the max to start at 3
  let zmin = 0;

  interface BetaDataItem {
    Name: string;
    iso_a2: string;
    iso_a3: string;
    Beta: string;
  }

  function betaDataItemValid(item: BetaDataItem) {
    return item.Name != "" && item.Beta != "" && item.iso_a3 != "";
  }

  betaData = betaData.filter(betaDataItemValid);

  betaData.map(function(countryData: BetaDataItem) {
    let reproductionNumber = parseFloat(countryData["Beta"]) * 2;
    info_by_iso3[countryData[ISO_KEY]] = {
      name: countryData["Name"],
      code: countryData["iso_a2"],
      z: reproductionNumber
    };
    _zmax = Math.max(_zmax, reproductionNumber);
  });

  let offset = 0.00001;
  let tick_values = get_tick_values(_zmax, 0.5);
  let tick_names = tick_values.map(value_to_labels);

  let zmax = zmin + (_zmax - zmin) / (1 - offset);
  let value_for_missing = zmax + offset;

  let GREEN_RGB = "rgb(0,200,0)";
  let YELLOW_RGB = "rgb(255,255,0)";
  let RED_RGB = "rgb(255,0,0)";
  let VIOLET_RGB = "rgb(143,0,255)";
  let BLACK_RGB = "rgb(60,60,60";

  function relativeBeta(beta: number) {
    return (beta * 2 - zmin) / (zmax - zmin);
  }

  let colorscale: Array<[number, string]> = [
    [0, GREEN_RGB],
    // the colors are specified for specific value of beta
    // the function relativeBeta converts the given beta to the number between 0 and 1
    [relativeBeta(0.4), GREEN_RGB],
    [relativeBeta(0.6), YELLOW_RGB],
    [relativeBeta(1), RED_RGB],
    [relativeBeta(1.8), VIOLET_RGB],
    [1 - offset, VIOLET_RGB],
    [1, BLACK_RGB]
  ];

  // this is a list of items that will later be putting into the plotly trace
  let items: Array<any> = [];
  for (let key in geoData.features) {
    let country = geoData.features[key].properties;
    let iso3 = country[ISO_KEY];
    if (iso3 === "-99") continue;

    let item: any = {
      name: country.admin || country.name,
      iso3
    };

    let info = info_by_iso3[iso3];
    if (info) {
      item.z = info.z;

      item.text =
        `<b>${item.name}</b><br />` +
        "Estimations:<br />" +
        `Effective reproduction number: <b>${item.z}</b><br />`;

      item.url_key = info.code;
    } else {
      item.z = value_for_missing;
      item.text = `<b>${item.name}</b><br />` + "No estimation";
      item.url_key = null;
    }

    items.push(item);
  }

  let mitigationMapData: Partial<Plotly.PlotData> = {
    // @ts-ignore
    type: "choroplethmapbox",
    name: "COVID-19: Effective reproduction number",
    geojson: geoData,
    featureidkey: "properties." + ISO_KEY,
    locations: items.map(thing => thing.iso3),
    z: items.map(thing => thing.z),
    zmax,
    zmin,
    text: items.map(thing => thing.text),
    colorscale,
    showscale: true,
    customdata: items.map(thing => thing.url_key),
    hovertemplate: "%{text}" + "<extra></extra>",
    hoverlabel: {
      font: {
        family: "DM Sans"
      }
    },
    colorbar: {
      thickness: 10,
      title: {
        text: "Effective reproduction number",
        side: "right",
        font: {
          color: "#B5B5B5",
          family: "DM Sans"
        }
      },
      tickvals: tick_values,
      ticktext: tick_names,
      tickfont: {
        color: "#B5B5B5",
        family: "DM Sans"
      }
    }
  };

  if (isTouchDevice()) {
    // @ts-ignore
    mitigationMapData.colorbar.x = 0;
  }

  let layout: Partial<Plotly.Layout> = {
    margin: { l: 0, r: 0, b: 0, t: 0 },
    mapbox: {
      style: "carto-darkmatter"
    },
    paper_bgcolor: "#222028",
    geo: {
      showframe: false,
      showcoastlines: false
    }
  };

  let config: Partial<Plotly.Config> = {
    displaylogo: false,
    responsive: true,
    displayModeBar: false,
    modeBarButtonsToRemove: ["toImage", "resetScale2d", "autoScale2d"]
  };

  Plotly.newPlot(caseMap, [mitigationMapData], layout, config).then(gd => {
    if (isTouchDevice()) {
      document
        .querySelectorAll(".map-nav-action")
        .forEach(elem => (elem.innerHTML = "Tap twice"));

      let last: null | string = null;

      gd.on("plotly_click", d => {
        let pt = (d.points || [])[0] as any;
        let target = pt.customdata;
        if (target && last === target) {
          window.open("/?selection=" + target);
        }
        last = target;
      });
    } else {
      gd.on("plotly_click", d => {
        let pt = (d.points || [])[0] as any;
        let target = pt.customdata;
        if (target) {
          window.open("/?selection=" + target);
        }
      });
    }
  });
}

const mitigationMap = document.getElementById(MAP_ID);
if (mitigationMap) {
  let data = makeDataStore();
  Promise.all([
    d3.csv(
      "https://storage.googleapis.com/static-covid/static/beta-estimates-2020-04-20-2.csv"
    ),
    data.geoData
  ]).then(([betaData, geoData]) =>
    makeMitigationMap(mitigationMap, betaData, geoData)
  );
}
