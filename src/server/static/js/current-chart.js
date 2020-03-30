
// graph
var currentGraph = document.getElementById("current_viz");

// graph layout
var currentLayout = {
  height: 800,
  //margin: { t: 0 },
  paper_bgcolor: "#222028",
  plot_bgcolor: "#222028",
  hovermode: "closest",
  xaxis: {
    type: "date",
    title: {},
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
    tickcolor: "#fff",
    showlabel: false,
    showline: true,
    autorange: "reversed"
  },
  yaxis: {
    title: "Symptomatic patients",
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
    domain: [0.2,1]
  },
  yaxis2: {
    domain: [0,0.1],
    tickfont: {
      family: "DM Sans, sans-serif",
      size: 14,
      color: "white"
    },
    automargin: true // FIXME
  },
  showlegend: false,
  barmode: "overlay",
  legend: {
    x: 1,
    xanchor: "right",
    y: 1,
    yanchor: "top",
    bgcolor: "#22202888",
    font: {
      color: '#fff'
    }
  },
  grid: {rows: 2, columns: 1, pattern: 'independent'}
};

var currentConfig = {
  displaylogo: false,
  responsive: true,
  scrollZoom: false
};

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


//TODO
function makeCached(retrieveFn){
  // let cache = null;
  
  return function(key, cb){
    // if(cache !== null && cache.key === key){
    //   cb(cache.value);
    // }

    retrieveFn(key, (value) => {
      // cache = {key, value};
      cb(value);
    })
  }
}

let retriveHistorical = makeCached((key, cb) => d3.json(`/static/historical_${key}.json`).then(cb));

function makeErrorTrace({color, fillcolor, name}, data){
  // error bars
  let errorTrace = {
    y: [],
    x: [],
    mode: "lines",
    line: {color: "transparent"},
    fillcolor: fillcolor, 
    fill: "tozerox", 
    type: "scatter",
    showlegend: false,
    hoverinfo: 'skip'
  }

  var f = d3.format(".2s");
  // estimation
  let meanTrace = {
    mode: "lines",
    x: [],
    y: [],
    line: {color: color},
    type: "scatter",
    name: name,
    hoverinfo: 'text',
    text: data.map(({low, high}) => `${name}: ${f(low)}-${f(high)}`)
  }

  data.forEach(({date,high,mean}) => {
    errorTrace.y.push(high)
    errorTrace.x.push(date)

    meanTrace.y.push(mean)
    meanTrace.x.push(date)
  })

  for (let i = data.length - 1; i >= 0; i--) {
    let {date,low} = data[i];
    errorTrace.y.push(low)
    errorTrace.x.push(date)
  }

  return [meanTrace, errorTrace];
}

const incubation_period = 5;
const onset_to_death = 9;

function addHistoricalCases(target, regionData, cb){
  let cfr = 0.016;
  let cfr_cv = 0.69; // coefficent of variance (relative sd) of cfr
  let pop = regionData.population;

  // retriveHistorical('italy', ({confirmed, deaths, dates}) => {
  //   // var highestVals = [];

  let timeseries = regionData.data.estimates.days;

  let cv = 3;
  let retrodicted = [];
  let reported = [];
  Object.keys(timeseries).forEach((date) => {
    let {JH_Deaths: deaths, JH_Infected: confirmed} = timeseries[date];

    if(deaths < 1){
      return;
    }

    let mean = (deaths/cfr)/pop;
    let low = applyVariance(mean, [cfr_cv, cv/Math.sqrt(deaths)], -1);
    let high = applyVariance(mean, [cfr_cv, cv/Math.sqrt(deaths)], 1);

    retrodicted.push({
      date: moment(date).subtract(onset_to_death, 'days').toDate(), 
      low: low,
      mean: mean,
      high: high
    })

    reported.push({
      date: date,
      confirmed: confirmed / pop,
      deaths: deaths / pop
    })
  })

  let symtomaticTraces = makeErrorTrace({color: "white", fillcolor: "rgba(255,255,255,0.3)", name: "Symptomatic (est.)"}, retrodicted)

  let reportedConfirmed = {
    mode: "markers",
    x: [],
    y: [],
    line: {color: "#fff"},
    type: "scatter",
    name: "Confirmed",
    marker: {size: 3},
    hovertemplate: 'Confirmed: %{y:.3s}',
  }

  let lastConfirmed = null;
  reported.forEach(({date, confirmed, deaths}) => {
    if(lastConfirmed !== confirmed){
      reportedConfirmed.x.push(date);
      reportedConfirmed.y.push(confirmed);
      lastConfirmed = confirmed
    }
  })

  let data = [
    reportedConfirmed,
    ...symtomaticTraces
  ];

  // redraw the lines on the graph
  Plotly.addTraces(target, data);

  if(cb){
    cb(retrodicted, reported);
  }
}

Plotly.newPlot(currentGraph, [], currentLayout, currentConfig);


function updateCurrentGraph(regionData, measureData){
  Plotly.react(currentGraph, [], currentLayout, currentConfig);

  addHistoricalCases(currentGraph, regionData, function(retrodicted, reported){
    // function mkDeltaTrace(name, other) {
    //   return {
    //     x: [],
    //     y: [],
    //     name: `Δ ${name}`,
    //     histfunc: "sum", 
    //     marker: {
    //       color: "rgba(255, 100, 102, 0.7)", 
    //       line: {
    //         color: "rgba(255, 100, 102, 1)", 
    //         width: 1
    //       }
    //     },
    //     autobinx: false,
    //     xbins:{size: "D1"},
    //     hovertemplate: "+%{y}",
    //     opacity: 0.5, 
    //     type: "histogram",
    //     ...other
    //   }
    // }

    // let predictedDeltas = mkDeltaTrace("Predicted");
    // for(let i = 1; i < retrodicted.length; i++){
    //   let delta = retrodicted[i].mean - retrodicted[i-1].mean;
    //   predictedDeltas.x.push(retrodicted[i].date);
    //   predictedDeltas.y.push(delta);
    // }


    // let confirmedDeltas = mkDeltaTrace("Confirmed");
    // let deathsDeltas = mkDeltaTrace("Deaths");
    // for(let i = 1; i < reported.length; i++){
    //   let {date, confirmed, deaths} = reported[i];
      
    //   confirmedDeltas.x.push(date);
    //   confirmedDeltas.y.push(confirmed - reported[i-1].confirmed);

    //   deathsDeltas.x.push(date);
    //   deathsDeltas.y.push(deaths - reported[i-1].deaths);
    // }

    // Plotly.addTraces(currentGraph, [predictedDeltas, deathsDeltas, confirmedDeltas]);

    let startDate = retrodicted[0].date;
    let endDate = moment().toDate();

    Plotly.relayout(currentGraph, {
      'xaxis.range': [startDate, endDate],
    });
  });

  addCurrentTraces(function (traces) {
    // redraw the lines on the graph
    Plotly.addTraces(currentGraph, traces);
    //addCriticalCareTrace(currentGraph, d3.extent(traces[0].x));
  })

  let measures = []
  measureData.forEach((measure) => {
    let {date_start, date_end, keywords} = measure;
    if(keywords === null || date_end === null){
      console.log('skipped measure:', measure)
      return;
    }

    keywords.forEach((type) => {
      measures.push({date_start, date_end, type});
    })
  })

  let measuresTraces = {
    base: [],
    x: [],
    y: [],
    yaxis: "y2",
    type: 'bar',
    orientation: 'h',
    marker: {color: "rgba(255,255,255,0.2)"},
    hoverinfo: "y",
    id: "measures"
  };

  measures.forEach(({date_start, date_end, type}) => {
    measuresTraces.base.push(moment(date_start).valueOf());
    measuresTraces.x.push(moment(date_end).valueOf()-moment(date_start).valueOf());
    measuresTraces.y.push(type);
  })

  // let measuresTraces = []
  // measures.forEach(({start, type}) => {
  //   start = moment(start);
  //   let end = moment(start).add(10,"days");
  //   console.log(start, end, type)

  //   //measuresTraces.push();

  //   measuresTraces.push({
  //     base: start.valueOf(),
  //     x: end.valueOf()-start.valueOf(),
  //     y: type,
  //     yaxis: "y2",
  //     type: 'bar',
  //     orientation: 'h',
  //     marker: {color: "rgba(255,255,255,0.3)"},
  //     hoverinfo: "y"
  //   });
  // })

  Plotly.addTraces(currentGraph, measuresTraces)

  currentGraph.on('plotly_unhover', function(){
    Plotly.relayout(currentGraph, {
      'shapes': []
    })
  });

  currentGraph.on('plotly_hover', function (evt){
    let point = evt.points[0];
    if(point.data.id !== "measures"){
      return;
    }

    let measureShapes = [];
    let measure = measures[point.pointIndex];
    let {date_end, date_start} = measure;
    measureShapes.push({
      type: 'line',
      yref: "paper",
      x0: moment(date_start).valueOf(),
      y0: 0,
      x1: moment(date_start).valueOf(),
      y1: 1,
      line: {color: "white"},
      opacity: 0.5
    })

    measureShapes.push({
      type: 'rect',
      yref: "paper",
      x0: moment(date_start).add(incubation_period, 'days').toDate(),
      y0: 0.2,
      x1: moment(date_end).add(incubation_period, 'days').toDate(),
      y1: 1,
      fillcolor: "white",
      line: {color: "transparent"},
      opacity: 0.1
    })

    Plotly.relayout(currentGraph, {
      'shapes': measureShapes
    })
  });
}