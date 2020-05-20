# Covid19Scenarios base URL generator

This script generates the json file `/frontend/data/base_urls.json` that contains the base URLs for all the supported scenarios in the Covid19Scenarios simulator.

Simply run `./generate.sh` to update the `base_urls.json` file. The script applies a patch with a small generator script to the covid19scenarios repository. If this patch breaks in compatibility, it will have to be fixed manually.

Assuming that covid19scenarios will have some backward compatibility for the URLs it is unlikely we will have to update the base_urls.json more than once a month or so.