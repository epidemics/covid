Plotly.d3.json(
  "https://storage.googleapis.com/static-covid/static/data-ttest5-v3.json",
  function(err, regions_data) {
    function unpack(rows, key) {
      return rows.map(function(row) {
        return row[key];
      });
    }

    function get_text(dict) {
      return Object.keys(dict).map(function(country) {
        var last_data = get_last_data(dict[country]);
        return last_data["FT_Infected"];
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
        risk = get_risk(dict[country]);
        return Math.log2(risk * 1000);
      });
    }

    function value_to_labels(v) {
      x = Math.pow(2, v) * 1000;
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

    var tick_values = [-3, -1, 1, 3, 5];
    var tick_names = tick_values.map(value_to_labels);

    var data = [
      {
        type: "choroplethmapbox",
        name: "COVID-19: Active infections estimate",
        geojson:
          "https://storage.googleapis.com/static-covid/static/data/casemap-geo.json",
        featureidkey: "properties.iso_a3",
        locations: get_locations(regions_data["regions"]),
        z: get_z(regions_data["regions"]),
        zmax: 5,
        zmin: -3,
        text: get_text(regions_data["regions"]),
        colorscale: [
          [0, "rgb(255,255,0)"],
          [1, "rgb(255,0,0)"]
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
      }
    ];

    var layout = {
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

    Plotly.newPlot("mapid", data, layout).then(gd => {
      gd.on("plotly_click", d => {
        var pt = (d.points || [])[0];
        window.open("/?selection=" + pt.customdata["country_to_search"]);
      });
    });
  }
);
