## Converting data into a single file

The data transformation pipeline assumes there is a folder with data from multiple GleamViz exported data

In the root of the project run:
```
python data-prep/process_data.py folder_with_all_runs_data selected_cities_file [output_file]
```
which creates a hdf file with a default name `covid_data.hdf` containing selected preprocessed data + metadata.

These can be loaded as:
```python
import pandas as pd
city_lookup = pd.read_hdf("covid_data.hdf", "data/city_lookup")
metadata = pd.read_hdf("covid_data.hdf", "metadata/model_info")
```

The `city_lookup` dataframe contains preprocessed timeseries from the simulation for each selected city. `metadata` currently contains only the date when the simulation was run (the first of all of the runs).

## Manual fixes
### `md_cities.tsv` issues
In the first version `export_experiment.tar.gz` (`md5sum: 0bdf3a07e70c28cd600a489abfbb9bb7`), there was a missing value on a row 551 in `Hemisphere ID`:
```python
                                  551
City ID                           551
City Name                    Sao Tome
Airport code                      TMS
Country ID                        192
Country name#   São Tomé and Principe
Region ID                           9
Region name             Middle Africa
Continent ID                        0
Continent name                 Africa
Hemisphere ID                     NaN
```
the fix should be probably replacing this value by `1` (for `Tropical` as per `md_hemispheres.tsv`). This is currently not checked or somehow fixed.

Also, there is a `#` at the end of `Country name#` column name.

#### Loading it efficiently
```python
import pandas as pd

dtypes = {'City ID': "int32",
 'City Name': pd.StringDtype(),
 'Airport code': pd.StringDtype(),
 'Country ID': "int32",
 'Country name#': pd.StringDtype(),
 'Region ID': "int32",
 'Region name': pd.StringDtype(),
 'Continent ID': "int32",
 'Continent name': pd.StringDtype(),
 'Hemisphere ID': pd.Int32Dtype()}

df = pd.read_csv('data_fixed/md_cities.tsv', sep='\t', dtype=dtypes)
```
