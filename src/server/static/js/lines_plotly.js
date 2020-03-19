
var plotyGraph = document.getElementById('my_dataviz');

var layout = {
    margin: { t: 0 },
    // title: '',
    paper_bgcolor: "#222028",
    plot_bgcolor: "#222028",
    // #222028
    xaxis: {
        type: 'date',
        title: 'Date',
        titlefont: {
          family: 'Arial, sans-serif',
          size: 18,
          color: 'white'
        },
        ticks: 'outside',
        tickfont: {
          family: 'Old Standard TT, serif',
          size: 14,
          color: 'white'
        },
        tick0: 0,
        dtick: 0.0,
        ticklen: 8,
        tickwidth: 1,
        tickcolor: '#fff',
        showgrid: false,
        zeroline: true,
        zerolinecolor: '#fff',
        zerolinewidth: 4,

    },
    yaxis: {
        title: 'Active infections as a percentage of the population',
        ticks: 'outside',
        tick0: 0,
        dtick: 0.0,
        ticklen: 8,
        tickwidth: 1,
        tickcolor: '#fff',
        showgrid: false,
        zeroline: true,
        zerolinecolor: '#fff',
        zerolinewidth: 4,
    }
};

var plotlyConfig = {
    displaylogo: false,
    responsive: true,
    scrollZoom: true,
};

Plotly.newPlot(plotyGraph, [{
x: [1, 2, 3, 4, 5],
y: [1, 2, 4, 8, 16] }], layout, plotlyConfig );

var dataJSON = null

jQuery.getJSON(
    "https://storage.googleapis.com/static-covid/static/data-" + (channel ? channel :'main') +"-gleam.json",
    function(data){
        console.log(data);
        dataJSON = data;
    }
)

function update_plot() {

    var mitigation_value = null
    var mitigation_ids = {
        "none": "None",
        "weak": "Low",
        "moderate": "Medium",
        "strong": "High",
    }

    for (mit_id in mitigation_ids) {
        if(document.getElementById("mitigation-" + mit_id).checked) {
            mitigation_value = mitigation_ids[mit_id];
        };
    };



    console.log(mitigation_value)
    var selectedCountry = document.getElementById("selectButton").value;
    console.log(selectedCountry)

    // TODO for testing only
    selectedCountry = "australia";


};


// https://plot.ly/javascript/configuration-options/#remove-modebar-buttons

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

var url_string = window.location.href;
var url = new URL(url_string);
var channel = url.searchParams.get('channel')



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
  console.log('selecteddOption', selectedOption)
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
