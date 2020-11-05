#!/usr/bin/env python
# this is a script that converts the traces.txt that Mrirank sends us into the npi_model.json format.
# Some renaming is done, which might have to be changed depending on changes in the traces.txt and desired
# descriptions of the interventions.

import json
import pandas as pd

data = pd.read_csv("traces.txt").rename({
    "# Mask Wearing": "Mask Wearing Mandatory in (Some) Public Spaces",
    "# Gatherings<1000": "Gatherings limited to...:1000 people or less",
    " Gatherings<100": "Gatherings limited to...:100 people or less",
    " Gatherings<10": "Gatherings limited to...:10 people or less",
    " Some Business": "Business suspended:Some",
    " Most Business": "Business suspended:Many",
    " School+Uni": "School and University Closure",
    " StayHome": "Stay Home Order (with exemptions)"
}, axis='columns')

data_dict = {}

for column in data.columns:
    data_dict[column] = list(data[column].values)

with open("npi_model.json", "w") as f:
    json.dump(data_dict, f)
