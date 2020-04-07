import * as Plotly from "plotly.js";

const MAP_ID = "mapid";

function makeMap(regions_data) {
  function unpack(rows, key) {
    return rows.map(function(row) {
      return row[key];
    });
  }

  function _get_text(dict) {
    return Object.keys(dict).map(function(country) {
      var last_data = get_last_data(dict[country]);
      var risk = last_data["FT_Infected"] / dict[country]["population"];
      var infected_per_1m = Math.round(risk * 1000000).toLocaleString();
      var infected_total = Math.round(
        last_data["FT_Infected"]
      ).toLocaleString();
      return (
        "Estimations:<br>" +
        "Infected per 1M: <b>" +
        infected_per_1m +
        "</b><br>" +
        "Infected total: <b>" +
        infected_total +
        "</b>"
      );
    });
  }

  function get_last_data(row) {
    var sorted = Object.keys(row["data"]["estimates"]["days"]).sort();
    var last = sorted[sorted.length - 1];
    return row["data"]["estimates"]["days"][last];
  }

  function get_risk(row) {
    var last_data = get_last_data(row);
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

  const iso_key = "iso_a3";

  var countries_json = JSON.parse(
    $.ajax({
      url:
        "https://storage.googleapis.com/static-covid/static/casemap-geo.json",
      dataType: "json",
      async: false
    }).responseText
  )["features"].map(function(item) {
    return item["properties"];
  });

  var countries = {};
  for (var item in countries_json) {
    if (countries[countries_json[item][iso_key]] !== "-99")
      countries[countries_json[item][iso_key]] =
        countries_json[item]["brk_name"];
  }

  var offset = 0.00001;
  var tick_values = [-3, -1, 1, 3, 5, 7, 9];
  var tick_names = tick_values.map(value_to_labels);

  var country_data = {};
  for (var country in regions_data["regions"]) {
    if ("iso_alpha_3" in regions_data["regions"][country]) {
      country_data[regions_data["regions"][country]["iso_alpha_3"]] =
        regions_data["regions"][country];
      country_data[regions_data["regions"][country]["iso_alpha_3"]][
        "name_lowercase"
      ] = country;
    }
  }

  var locations = Object.keys(countries);

  var _z_data = get_z(regions_data["regions"]);
  var _z_max = Math.max(..._z_data.filter(x => !isNaN(x)), 2); // z_max is at least 2
  var z_min = -3.5;

  var z_max = z_min + (_z_max - z_min) / (1 - offset);
  var value_for_missing = z_max + offset;

  var z_data = locations.map(function(country) {
    if (country in country_data) {
      const risk = get_risk(country_data[country]);
      return Math.log(risk * 1000) / Math.log(2);
    }
    return value_for_missing;
  });

  var text = locations.map(function(country) {
    if (country in country_data) {
      var last_data = get_last_data(country_data[country]);
      var risk = last_data["FT_Infected"] / country_data[country]["population"];
      var infected_per_1m = Math.round(risk * 1000000).toLocaleString();
      var infected_total = Math.round(
        last_data["FT_Infected"]
      ).toLocaleString();
      return (
        "Estimations:<br>" +
        "Infected per 1M: <b>" +
        infected_per_1m +
        "</b><br>" +
        "Infected total: <b>" +
        infected_total +
        "</b>"
      );
    }
    return "No estimation";
  });

  var customdata = locations.map(function(country) {
    if (country in country_data) {
      return {
        country_to_search: country_data[country]["name_lowercase"].replace(
          " ",
          "+"
        ),
        country_name: country_data[country]["name"]
      };
    }
    return {
      country_name: countries[country]
    };
  });

  let data: Array<Partial<Plotly.PlotData>> = [
    {
      type: "choroplethmapbox",
      name: "COVID-19: Active infections estimate",
      geojson:
        "https://storage.googleapis.com/static-covid/static/casemap-geo.json",
      featureidkey: "properties." + iso_key,
      locations: locations,
      z: z_data,
      zmax: z_max,
      zmin: z_min,
      text: text,
      colorscale: [
        [0, "rgb(255,255,0)"],
        [0.9, "rgb(255,0,0)"],
        [1 - offset, "rgb(200,0,0)"],
        [1, "rgb(70,70,70"]
      ],
      showscale: true,
      customdata: customdata,
      hovertemplate:
        "<b>%{customdata.country_name}</b><br><br>" +
        "%{text}" +
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
      if ("country_to_search" in pt.customdata) {
        window.open("/?selection=" + pt.customdata["country_to_search"]);
      }
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
