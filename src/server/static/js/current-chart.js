
// graph
var currentGraph = document.getElementById("current_viz");

// graph layout
var layout = {
  height: 600,
  //margin: { t: 0 },
  paper_bgcolor: "#222028",
  plot_bgcolor: "#222028",
  xaxis: {
    type: "date",
    title: "Date",
    titlefont: {
      family: "DM Sans, sans-serif",
      size: 18,
      color: "white"
    },
    ticks: "outside",
    tickfont: {
      family: "DM Sans, sans-serif",
      size: 14,
      color: "white"
    },
    tick0: 0,
    dtick: 0.0,
    ticklen: 8,
    tickwidth: 1,
    tickcolor: "#fff"
  },
  yaxis: {
    title: "Active infections",
    titlefont: {
      family: "DM Sans, sans-serif",
      size: 18,
      color: "white"
    },
    tickfont: {
      family: "DM Sans, sans-serif",
      size: 14,
      color: "white"
    },
    ticks: "outside",
    tick0: 0,
    dtick: 0.0,
    ticklen: 8,
    tickwidth: 1,
    tickcolor: "#fff",
    showline: true,
    linecolor: "#fff",
    linewidth: 1,
    showgrid: false,
    zeroline: true,
    zerolinecolor: "#fff",
    zerolinewidth: 1,
    type: 'log',
  },
  showlegend: true,
  legend: {
    x: 1,
    xanchor: "right",
    y: 1,
    yanchor: "top",
    bgcolor: "#22202888",
    font: {
      color: '#fff'
    }
  }
};

var plotlyConfig = {
  displaylogo: false,
  responsive: true,
  scrollZoom: false
};



Plotly.newPlot(currentGraph, [], layout, plotlyConfig);
addHistoricalData(currentGraph, 1);
Plotly.relayout(currentGraph, {
  'xaxis.range': [moment("February 1 2020").toDate(), moment().toDate()]
});


// coefficent of variation
function relativeVariance(value, mean){
  let relativeSD = (value-mean)/mean;
  return relativeSD * relativeSD;
}

function applyVariance(mean, vars, sigma){
  let totalVar = 0;
  vars.forEach((v) => {
    totalVar += v * v;
  })

  let val = mean * Math.exp(sigma * Math.sqrt(totalVar));
  return val;
}

function addHistoricalData(plotlyGraph, pop){
  let cfr = 0.016;
  let cfr_cv = 0.5; // coefficent of variance (relative sd) of cfr

  let incubation_period = 5;
  let onset_to_death = 10;

  d3.json(
    `/static/test_italy.json`
  ).then(function ({confirmed, deaths, dates}) {
    // var highestVals = [];


    dates = dates.map((date) => moment(date).subtract(incubation_period + onset_to_death, 'days').toDate());

    // error bars
    let errors = {
      y: deaths.map((v) => applyVariance(v/cfr/pop, [cfr_cv, 3/Math.sqrt(v)], 1)),
      x: dates,
      mode: "lines",
      line: {color: "transparent"},
      fillcolor: "rgba(255,255,255,0.2)", 
      fill: "tozerox", 
      type: "scatter",
      name: "Estimated error",
      showlegend: false,
      hoverinfo: 'skip'
    }

    let max = errors.y[errors.y.length - 1];

    console.log(errors.y.slice(0));
    console.log(max);

    for(let i = deaths.length-1; i >= 0; i--){
      let v = deaths[i];
      errors.y.push(applyVariance(v/cfr/pop, [cfr_cv, 10/Math.sqrt(v)],-1));
      errors.x.push(dates[i]);
    }

    var f = d3.format(".2s");
    let text = deaths.map((v, i) => {
      let low = applyVariance(v/cfr/pop, [1/2, 10/Math.sqrt(1+v)],-1);
      let high = applyVariance(v/cfr/pop, [1/2, 10/Math.sqrt(1+v)],1);
      return `Estimated: ${f(low)}-${f(high)}`;
    });

    let data = [
      {
        mode: "markers",
        x: dates,
        y: confirmed.map((v) => v/pop),
        line: {color: "#fff"},
        type: "scatter",
        name: "Confirmed",
        marker: {size: 3},
        hovertemplate: 'Confirmed: %{y:.3s}',
      },
      {
        mode: "lines",
        x: dates,
        y: deaths.map((death) => death/cfr/pop),
        line: {color: "#fff"},
        type: "scatter",
        name: "Estimated",
        hoverinfo: 'text',
        text: text
      },
      errors
    ];

    console.log("range", [10, errors.y]);

    // redraw the lines on the graph
    Plotly.addTraces(plotlyGraph, data);
  });
}