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

