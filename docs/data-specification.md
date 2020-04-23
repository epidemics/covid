# JSON data export specification

**Current spec version: v3 (2020-03-24)**

**Channels.** The data is uploaded in channels, so that multiple versions of data can be accesible at once.
The default channel name uset at the main site is `main` - be careful uploading to it; please test first. Channel can be an arbitrary name, use common sense. `CHANNEL` shuld be replaced by chanel name below.

**URLs.** The main data file is loaded as JSON from https://stoage.googleapis.com/static-covid/static/data-CHANNEL-v3.json, e.g. https://storage.googleapis.com/static-covid/static/data-main-v3.json

**NB.** When uploading the files, make sure you set a reasonably low chache timeout - GS default is 1 hour, making updates very slow to propagate!

```sh
gsutil -m -h "Cache-Control:public, max-age=60" cp -a public-read SRC DST
```

## Common structure

```json
    { "created": "DATETIME", "created_by": "gavento@chiru", "comment": "optional",
      "regions": {
        "new york": {"name": "New York city", "kind": "state", "gleam_id": 34,
        "population": 82790000, "lat": 2.34, "lon": -4.56,
        "data": { "DATA_FEATURE_NAME": {...}, ... }},
        ...}
    }
```

The regions map key is just an ID (and will likely be changed to ISO codes), so please display the `name`. `lat, lon` are optional (not in all data yet, but can be added later).

## Plotly traces

Per-country graph data is stored as [Plotly traces](https://plotly.com/javascript/reference/#scatter) in per-region files (loaded on demand and cached).

```json
    "data": {"infected_per_1000": {
        # The URL is realtive to the main JSON file location
        # The URL is region-specific
        "traces_url": "batch-2020-03-24T14-21-26.610749+01-00-ttest5/lines-traces-albania.json"
    }
```

The traces file is structured by mitigation:

```json
"None": [{"x": [DAY, DAY, ...], "y": [1.0, 2.0, ...], "name": "..", ...}, PLOTLY_TRACE, ...],
"Low": [PLOTLY_TRACE, PLOTLY_TRACE, ...],
```

The arrays contain valid Plotly traces (including name and line style). The dates are days in ISO format.

**Bandwidth optimization.** If `TRACE.x` has length exactly 1, it is assumed that the next
dates are 1 day apart, same lengts as `TRACE.y`.
The JS implementation MUST fill the array before passing it to plotly.
(See e.g. the [implementation here](https://github.com/epidemics/covid/blob/46d721178fa91a65722b6337794119fff52e47e6/src/server/static/js/lines.js#L182)).

## Case data (formerly "Estimates")

The region estimates are stored in the following way:

```json
"data": {"estimates": {
    "days": {
        "2020-03-16": {
            ## John hopkins numbers
            "JH_Deaths": 21,
            "JH_Confirmed": 354,    ## These are all confirmed cases, including dead and recovered
            "JH_Recovered": 63,
            "JH_Infected": 270,     ## This is the number of currently infected

            ## Our estimates
            "FT_Infected": 2138,    ## Mean estimate

            ## CIs currently not present
            "FT_Infected_q05": 453, ## lower 90% confidence interval (0.05 quantile)
            "FT_Infected_q95": 6435 ## upper 90% confidence interval (0.95 quantile)
          },
        "2020-03-17": { ... },
        "2020-03-18": { ... }
      }
    }}
```

The date closest to today (e.g. latest before tomorrow) should get displayed (with a last-updated note). (Now just one date is reported.)
