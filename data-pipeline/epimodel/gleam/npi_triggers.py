from .batch import Batch
import pandas as pd
import io


class NPITriggerConfig:
    def __init__(self, filename=None, text=None):
        assert (filename is None) != (text is None)
        if filename is not None:
            f = filename
        else:
            f = io.StringIO(text)
        df = pd.read_csv(f, header=0, dtype=str, na_values=[], keep_default_na=False)
        assert df.columns[0] == "RegionCode"
        df = df.loc[df.RegionCode != ""]
        print(df)

    def create_updated_batch(
        self, in_batch: Batch, out_batch: Batch, truncated_simulations: bool = True
    ):
        for k in in_batch.hdf.keys():
            if k not in ("/simulations", "/triggered_levels"):
                out_batch.hdf[k] = in_batch.hdf[k]
