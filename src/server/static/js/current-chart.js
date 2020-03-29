
// graph
var currentGraph = document.getElementById("current_viz");

// graph layout
var currentLayout = {
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
  }
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

let retriveHistorical = makeCached((key, cb) => d3.json(`/static/test_${key}.json`).then(cb));

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

function addHistoricalCases(target, pop, cb){
  let cfr = 0.016;
  let cfr_cv = 0.69; // coefficent of variance (relative sd) of cfr

  let incubation_period = 5;
  let onset_to_death = 9;

  retriveHistorical('italy', ({confirmed, deaths, dates}) => {
    // var highestVals = [];

    console.log(deaths);

    let cv = 3;
    let retrodicted = [];
    deaths.forEach((v, i) => {
      if(v < 1){
        return;
      }

      let mean = (v/cfr)/pop;
      let low = applyVariance(mean, [cfr_cv, cv/Math.sqrt(v)], -1);
      let high = applyVariance(mean, [cfr_cv, cv/Math.sqrt(v)], 1);

      retrodicted.push({
        date: moment(dates[i]).subtract(onset_to_death, 'days').toDate(), 
        low: low,
        mean: mean,
        high: high
      })
    })

    let symtomaticTraces = makeErrorTrace({color: "white", fillcolor: "rgba(255,255,255,0.3)", name: "Symptomatic (est.)"}, retrodicted)

    let reported = [];
    for(let i = 0; i < dates.length; i++){
      reported.push({
        date: dates[i],
        confirmed: confirmed[i] / pop,
        deaths: deaths[i] / pop
      })
    }

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
  });
}

$(function(){
  let pop = 60.48 * 1000 * 1000;
  Plotly.newPlot(currentGraph, [], currentLayout, currentConfig);
  addHistoricalCases(currentGraph, pop, function(retrodicted, reported){
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
})