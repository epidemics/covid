## Fixing gleamviz data
First fix `md_*.tsv` files which sometime countain two records of a single line. The script
also removes unnecessary `ID` column to unify the format with the rest of the exported files.
The following sed command removes leading space in all TSV files:

```
$ python remove_doubles.py <gleamviz-exported-data> data_fixed
$ sed -i 's/^\t/  /; s/  //' **.tsv
```

then you should be able to standardly load the data in pandas. Tested on linux.

```python
import pandas as pd
filename = "md_countries.tsv"  # or any other file
df = pd.read_csv(filename, sep="\t", index_col=0)
```

