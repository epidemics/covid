import * as Plotly from "plotly.js";

const MAP_ID = "mapid";

function makeMap(regions_data) {
  function unpack(rows, key) {
    return rows.map(function(row) {
      return row[key];
    });
  }

  function get_text(dict) {
    return Object.keys(dict).map(function(country) {
      let last_data = get_last_data(dict[country]);
      return last_data["FT_Infected"];
    });
  }

  function get_last_data(row) {
    let sorted = Object.keys(row["data"]["estimates"]["days"]).sort();
    let last = sorted[sorted.length - 1];
    return row["data"]["estimates"]["days"][last];
  }

  function get_risk(row) {
    let last_data = get_last_data(row);
    return last_data["FT_Infected"] / row["population"];
  }

  function get_z(dict) {
    return Object.keys(dict).map(function(country) {
      const risk = get_risk(dict[country]);
      return Math.log(risk * 1000) / Math.log(2);
    });
  }

  function value_to_labels(v) {
    const x = Math.pow(2, v) * 1000;
    if (x >= 1000) {
      return (x / 1000).toString() + "k";
    }
    return x.toString();
  }

  function get_locations(dict) {
    return Object.keys(dict).map(function(country) {
      return dict[country]["iso_alpha_3"];
    });
  }

  function get_customdata(dict) {
    return Object.keys(dict).map(function(country) {
      return {
        country_to_search: country.replace(" ", "+"),
        infected_per_1m: get_risk(dict[country]) * 1000000,
        country_name: dict[country]["name"],
        est_active: get_last_data(dict[country])["FT_Infected"]
      };
    });
  }

  let tick_values = [-3, -1, 1, 3, 5, 7, 9];
  let tick_names = tick_values.map(value_to_labels);

  var z_data = get_z(regions_data["regions"]);
  var z_max = Math.max(...z_data.filter(x => !isNaN(x)), 2); // z_max is at least 2
  var z_min = -3.5;

  let data: Array<Partial<Plotly.PlotData>> = [
    {
      type: "choroplethmapbox",
      name: "COVID-19: Active infections estimate",
      geojson:
        "https://storage.googleapis.com/static-covid/static/casemap-geo.json",
      featureidkey: "properties.iso_a3",
      locations: get_locations(regions_data["regions"]),
      z: z_data,
      zmax: z_max,
      zmin: z_min,
      text: get_text(regions_data["regions"]),
      colorscale: [
        [0, "rgb(255,255,0)"],
        [0.9, "rgb(255,0,0)"],
        [1, "rgb(200,0,0)"]
      ],
      showscale: true,
      customdata: get_customdata(regions_data["regions"]),
      hovertemplate:
        "<b>%{customdata.country_name}</b><br><br>" +
        "Estimations:<br>" +
        "Infected per 1M: <b>%{customdata.infected_per_1m:,.0f}</b><br>" +
        "Infected total: <b>%{customdata.est_active:,.0f}</b>" +
        "<extra></extra>",
      hoverlabel: {
        font: {
          family: "DM Sans"
        }
      },
      colorbar: {
        y: 0,
        yanchor: "bottom",
        title: {
          text: "Infected per 1M",
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
    } as any
  ];

  let layout = {
    title: {
      text: "COVID-19: Active infections estimate (fraction of population)",
      font: {
        color: "#E9E9E9",
        size: 25,
        family: "DM Sans"
      }
    },
    mapbox: {
      style: "carto-darkmatter"
    },
    paper_bgcolor: "#222028",
    geo: {
      showframe: false,
      showcoastlines: false
    }
  };

  Plotly.newPlot(caseMap, data, layout).then(gd => {
    gd.on("plotly_click", d => {
      let pt = (d.points || [])[0] as any;
      window.open("/?selection=" + pt.customdata["country_to_search"]);
    });
  });
}

let caseMap = document.getElementById(MAP_ID);
if (caseMap !== null) {
  Plotly.d3.json(
    "https://storage.googleapis.com/static-covid/static/data-main-v3.json",
    (err, data) => {
      // TODO error handling
      makeMap(data);
    }
  );
}
