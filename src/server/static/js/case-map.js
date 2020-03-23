Plotly.d3.csv('https://storage.googleapis.com/static-covid/static/case-map-data.csv', function(err, rows) {
	function unpack(rows, key) {
		return rows.map(function(row) {
			return row[key];
		});
	}


	function get_text(rows) {
		return rows.map(function(row) {
			return row["est_active"] + " estimated active";
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

    //function get_country(rows) {
	//	return rows.map(function(row) {
	//	    if (!(row['code'] in country_map)) {
	//	        return row['name'].toLowerCase().replace(" ", "+")
	//	    }
	//		return country_map[row['code']];
	//	});
	//}

	function get_country(rows) {
	    return rows.map(function(row) {
	        return country_map[row['code']]
	    });
	}

	var data = [{
		type: "choroplethmapbox",
		name: "US states",
		geojson: "/static/data/custom.geo.json",
		featureidkey: "properties.iso_a3",
		locations: unpack(rows, 'code'),
        z: unpack(rows, 'risk'),
        text: get_text(rows),
		colorscale: [[0,'rgb(255,255,255)'],[1,'rgb(255,0,0)']],
		showscale: true,
		customdata: get_country(rows),
		colorbar: {
			y: 0,
			yanchor: "bottom",
			title: {
				text: "Risk",
				side: "right"
			}
		}
	}];

	var layout = {
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
                window.open("/?selection="+pt.customdata,);
            })
    })
});