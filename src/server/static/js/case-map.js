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


	Plotly.newPlot('mapid', data, layout);
});