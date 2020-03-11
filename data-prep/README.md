## Fixing gleamviz data
First fix `md_*.tsv` files which sometime countain two records on a single line. The script
also removes unnecessary `ID` column to unify the format with the rest of the exported files.
Then follow with a simple `sed` command removes leading space in all TSV files:

```
$ python remove_doubles.py <gleamviz-exported-data> data_fixed
# removes # and leading space
$ sed -i 's/#//;s/^.//' data_fixed/*/*.tsv
```

then you should be able to standardly load the data in pandas. Tested on linux.

```python
# in python shell
import pandas as pd
filename = "data_fixed/md_countries.tsv"  # or any other converted file
df = pd.read_csv(filename, sep="\t", index_col=0)
```

## Converting data into a single file
On the result above, you can trigger
```
python convert_to_dfs.py data_fixed
```
which creates a Parquet file `area.pq` with all TSVs from different areas
in a single dataframe with somewhat resonable memory usage (currently <200 MB).

This can be loaded as:
```
import pandas as pd
df = pd.read_parquet("area.pq")

# and optionally set index to follow the directory structure via
# df = df.set_index(["area_type", "source_main", "source_sec"])
```

## Manual fixes
In the first version `export_experiment.tar.gz` (`md5sum: 0bdf3a07e70c28cd600a489abfbb9bb7`), there was a missing value on a row 551 in `Hemisphere ID`:
```
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
