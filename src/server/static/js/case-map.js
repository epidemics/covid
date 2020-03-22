Plotly.d3.csv('/static/data/test_data.csv', function(err, rows) {
	function unpack(rows, key) {
		return rows.map(function(row) {
			return row[key];
		});
	}

	var data = [{
		type: "choroplethmapbox",
		name: "US states",
		geojson: "/static/data/custom.geo.json",
		featureidkey: "properties.iso_a3",
		locations: unpack(rows, 'CODE'),
        z: unpack(rows, 'GDP (BILLIONS)'),
        text: unpack(rows, 'COUNTRY'),
		colorscale: [[0.0,'rgb(255,255,255)'],[1,'rgb(255,0,0)']],
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