var url_string = window.location.href;
var url = new URL(url_string);
var channel = url.searchParams.get('channel')

var dataJSON = null;
var listOfRegions = null;
var selected = {
   country: "france",
   mitigation: "none"
};

// dropdown of countries
var selectButton = document.getElementById("selectButton");

// graph
var plotyGraph = document.getElementById('my_dataviz');

// graph layout
var layout = {
    height: 675,
    //margin: { t: 0 },
    paper_bgcolor: "#222028",
    plot_bgcolor: "#222028",
    xaxis: {
        type: 'date',
        title: 'Date',
        titlefont: {
          family: 'DM Sans, sans-serif',
          size: 18,
          color: 'white'
        },
        ticks: 'outside',
        tickfont: {
          family: 'DM Sans, sans-serif',
          size: 14,
          color: 'white'
        },
        tick0: 0,
        dtick: 0.0,
        ticklen: 8,
        tickwidth: 1,
        tickcolor: '#fff',

    },
    yaxis: {
        title: 'Active infections as a percentage of the population',
        titlefont: {
          family: 'DM Sans, sans-serif',
          size: 18,
          color: 'white'
        },
        ticks: 'outside',
        tickfont: {
          family: 'DM Sans, sans-serif',
          size: 14,
          color: 'white'
        },
        ticks: 'outside',
        tick0: 0,
        dtick: 0.0,
        ticklen: 8,
        tickwidth: 1,
        tickcolor: '#fff',
        showline: true,
        linecolor: '#fff',
        linewidth: 1,
        showgrid: false,
        zeroline: true,
        zerolinecolor: '#fff',
        zerolinewidth: 1,

        range: [0, 1]
    }
};

var colors = [
    "#edcdab",
    "#edb77e",
    "#e97f0f",
    "#9ac9d9",
    "#5abbdb",
    "#007ca6"
]

var plotlyConfig = {
    displaylogo: false,
    responsive: true,
    scrollZoom: true,
};

Plotly.newPlot(plotyGraph, [], layout, plotlyConfig );


/* start from lines.js */
function getSelectedCountry(data) {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var c = url.searchParams.get("selection");
  return c && data.map(c => c.key).includes(c) ? c : "hong kong city";
}

function getMaxYValueForCountry(mitigations) {
  var highestVals = [];
  for (m in mitigations) {
    for (a in mitigations[m]) {
      highestVals.push(Math.max(...mitigations[m][a]));
    }
  }
  return Math.max(...highestVals);
}

function getListOfScenarios(activeData) {
  return Object.keys(activeData);
}

function getListOfRegions(regions) {
  return Object.keys(regions).map(k => {
    return { key: k, value: regions[k].name }
  })
}

function setGetParam(key, value) {
  if (history.pushState) {
    var params = new URLSearchParams(window.location.search);
    params.set(key, value);
    var newUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      params.toString();
    window.history.pushState({ path: newUrl }, "", newUrl);
  }
}
/* end from lines.js */




// triggered by change of country in the drop down menu
function country_change() {
    // recover the option that has been chosen
    selected.country = selectButton.value;
    // change url param
    setGetParam("selection", selected.country);
    var countryName = listOfCountries.find(c => c.key == selected.country).value
    // update the graph
    update_plot()
    // update the containment measures with the new selected country
    update_containment_measures(countryName);
    // update the name of the country in the text below the graph
    update_country_in_text(countryName);
};


// load the data used for the graph
jQuery.getJSON(
    "https://storage.googleapis.com/static-covid/static/data-" + (channel ? channel :'main') +"-gleam.json",
    function(data){
        dataJSON = data;
        // populate the dropdown menu with countries from received data
        listOfCountries = getListOfRegions(data.regions);
        var region = null;
        for(k in listOfCountries) {
           region = listOfCountries[k]
           var opt = document.createElement("option");
           opt.value = region.key;
           opt.innerHTML = region.value;
           selectButton.appendChild(opt);
        }
        // initialize the graph
        update_plot(opt=selected)
    }
)

// update the graph
function update_plot(opt=null) {
    var mitigation_value = null
    var mitigation_ids = {
        "none": "None",
        "weak": "Low",
        "moderate": "Medium",
        "strong": "High",
    }

    if(opt != undefined) {
        // assign value of the mitigation given by argument
        document.getElementById("mitigation-" + opt.mitigation).click();
        mitigation_value = mitigation_ids[opt.mitigation];

        // assign value of the country given by argument
        var selectedCountry = opt.country;
        document.getElementById("selectButton").value = selectedCountry;
    }
    else {
        // find the current value of the mitigation
        for (mit_id in mitigation_ids) {
            if(document.getElementById("mitigation-" + mit_id).checked) {
                mitigation_value = mitigation_ids[mit_id];
            };
        };
        // find the current value of the selected country
        var selectedCountry = document.getElementById("selectButton").value;

        // update the selected variable
        selected = {
            country: selectedCountry,
            mitigation: mitigation_value
        };
    }

    // find the max value across all mitigations and update the axis range
    y_max = getMaxYValueForCountry(dataJSON.regions[selectedCountry].data.infected_per_1000.mitigations)
    layout.yaxis.range = [0, y_max];

    var countryData = dataJSON.regions[selectedCountry].data.infected_per_1000.mitigations[mitigation_value];

    traces = [];

    var x = null
    var x_start = dataJSON.regions[selectedCountry].data.infected_per_1000.start;

    var idx = 0
    for (seasonality in countryData) {
        // the x axis is the same for all traces so only defining it once
        if (x == undefined) {
            x = new Array(countryData[seasonality].length)
            for(i=0;i<countryData[seasonality].length;++i) {
                x[i] = new Date(x_start);
                x[i].setDate(x[i].getDate() + i);
            };
        };
        traces.push({
            x: x,
            y: countryData[seasonality],
            mode: 'lines',
            name: seasonality,
            line: {
                dash: 'solid',
                width: 1,
                color: colors[idx]
            }
        });
        idx = idx + 1;
    };
    // redraw the lines on the graph
    Plotly.newPlot(plotyGraph, traces, layout, plotlyConfig);
};

/* CONTAINMENT MEASURES */
function update_country_in_text(selectedCountry) {
  var countrySpans = jQuery(".selected-country");
  for (i = 0; i < countrySpans.length; i++) {
    countrySpans[i].innerHTML = selectedCountry;
  }
}

function containment_entry(date = "", text = "", source_link = "") {
  /* write that jinja code with js for model.html template sidebar with containment measures entry
   * <div class="containment_measure">
   *   <h3 class="num">{{ date }}</h3>
   *   <div class="area">{{ text }} <a href="{{ source_link }}" target="_blank">Source</a></div>
   *</div>
   */
  var entryDiv = document.createElement("DIV");
  entryDiv.setAttribute("class", "containment_measure");
  var title = document.createElement("H6");
  title.setAttribute("class", "num");
  title.innerHTML = date;
  var textDiv = document.createElement("DIV");
  textDiv.setAttribute("class", "area");
  textDiv.innerHTML =
    text + " <a href='" + source_link + "'target='_blank'>Source</a>";
  entryDiv.appendChild(title);
  entryDiv.appendChild(textDiv);
  return entryDiv;
}

function update_containment_measures(selectedOption) {
  jQuery.get({
    url: "/get_containment_measures",
    data: { country: selectedOption },
    dataType: "json",
    success: function (data) {
      // find the div dedicated to the side bar on the model.html template
      var containmentMeasuresDiv = document.getElementById(
        "containment_measures"
      );
      containmentMeasuresDiv.textContent = "";
      var divTitle = document.createElement("H5");
      divTitle.innerHTML = "Containment measures";

      containmentMeasuresDiv.append(divTitle);
      var containmentMeasuresSource = document.createElement("a");
      var linkText = document.createTextNode("(data source)");
      containmentMeasuresSource.appendChild(linkText);
      containmentMeasuresSource.title = "(data source)";
      containmentMeasuresSource.href =
        "https://www.notion.so/977d5e5be0434bf996704ec361ad621d?v=aa8e0c75520a479ea48f56cb4c289b7e";
      containmentMeasuresDiv.append(containmentMeasuresSource);

      if (data != undefined) {
          data.forEach(function (item, index) {
                containmentMeasuresDiv.appendChild(
                containment_entry(
                  (date = item["date"]),
                  (text = item["description"]),
                  (source_link = item["source"])
                )
              );
          });
      } else {
        var emptyDatasetMsg = document.createElement("P");
        emptyDatasetMsg.innerHTML =
          "There are no containment measures for this country in our database at the moment";
        containmentMeasuresDiv.appendChild(emptyDatasetMsg);
      }
    }
  });
}
