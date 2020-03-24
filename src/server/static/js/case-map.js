Plotly.d3.csv('https://storage.googleapis.com/static-covid/static/case-map-data.csv', function(err, rows) {
	function unpack(rows, key) {
		return rows.map(function(row) {
			return row[key];
		});
	}

	function log_data(rows, key) {
		return rows.map(function(row) {
			return Math.log(row[key]);
		});
	}

	function exp_data(x) {
		return Math.exp(x);
	}

	function get_text(rows) {
		return rows.map(function(row) {
			return row["est_active"];
		});
	}

	var country_map = {
          "AUS": "australia",
          "CHE": "switzerland",
          "CZE": "czech+republic",
          "DEU": "germany",
          "EGY": "egypt",
          "ESP": "spain",
          "FRA": "france",
          "GBR": "united+kingdom",
          "IDN": "indonesia",
          "IND": "india",
          "IRN": "iran",
          "ITA": "italy",
          "JPN": "japan",
          "KOR": "south+korea",
          "NLD": "netherlands",
          "RUS": "russia",
          "SGP": "singapore",
          "USA": "united+states",
    };

    function get_infected_per_1m(rows) {
		return rows.map(function(row) {
			return row["risk"] * 1000000;
		});
	}

	function get_country(rows) {
	    return rows.map(function(row) {
	        return country_map[row['code']]
	    });
	}

	function get_customdata(rows) {
	    return rows.map(function(row) {
	        return {
	            "country": country_map[row['code']],
	            "orig_risk": row['risk'],
	            "infected_per_1m": row['risk'] * 1000000,
	            "country_name": row['name'],
	            "est_active": row['est_active'],
	        }
	    });
	}

	function get_z(rows) {
		return rows.map(function(row) {
			return Math.log2(row["risk"] * 1000);
		});
	}


	var data = [{
		type: "choroplethmapbox",
		name: "US states",
		geojson: "/static/data/custom.geo.json",
		featureidkey: "properties.iso_a3",
		locations: unpack(rows, 'code'),
        z: get_z(rows),
        zmax: 5,
        zmin: -3,
        text: get_text(rows),
		colorscale: [[0,'rgb(255,255,0)'],[1,'rgb(255,0,0)']],
		showscale: true,
		customdata: get_customdata(rows),
		hovertemplate:
		    '<b>%{customdata.country_name}</b><br><br>' +
		    'Estimations:<br>' +
		    'Infected per 1M: <b>%{customdata.infected_per_1m:,.0f}</b><br>' +
		    'Infected total: <b>%{customdata.est_active:,.0f}</b>' +
            '<extra></extra>',
		//hovertemplate:
        //    "<b>%{text}</b><br><br>" +
        //    "%{yaxis.title.text}: %{y:$,.0f}<br>" +
        //    "%{xaxis.title.text}: %{x:.0%}<br>" +
        //    "Number Employed: %{marker.size:,}" +
        //    "<extra></extra>",
		colorbar: {
			y: 0,
			yanchor: "bottom",
			title: {
				text: "Infected per 1M",
				side: "right",
				font: {
				    color: "#B5B5B5",
				}
			},
			tickvals: [-3, -1, 1, 3, 5],
			ticktext: ["125", "500", "2k", "8k", "32k"],
			tickfont: {
			    color: "#B5B5B5",
			}
		}
	}];

	var layout = {
	    title: {
	        text: "Estimations for number of infected people.",
	        font: {
	            color: "#E9E9E9",
	            size: 25,
	        }
	    },
		mapbox: {
			style: "carto-darkmatter",
		},
		paper_bgcolor: "#222028",
		geo: {
			showframe: false,
			showcoastlines: false,
		},
	};

	Plotly.newPlot('mapid', data, layout)
	    .then(gd => {
            gd.on('plotly_click', d => {
                var pt = (d.points || [])[0]
                console.log('you clicked on '+pt.location)
                window.open("/?selection="+pt.customdata["country"],);
            })
    })
});