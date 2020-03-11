import pandas as pd
import os.path
import glob
from multiprocessing.pool import Pool
from multiprocessing import cpu_count
import time
import argparse

parser = argparse.ArgumentParser(
    description="Create a single parquet file from the preprocessed gleamviz data"
)
parser.add_argument("input_dir", help="The input directory with fixed data")
parser.add_argument("--output", help="Name of the output file", default="areas.pq")
args = parser.parse_args()

start = time.time()

all_files = glob.glob(os.path.join(args.input_dir, "*/*.tsv"))
print(f"Going to process {len(all_files)} files...")
outfile = args.output

DTYPES = {
    "Median": "float32",
    "Lower 95%CI": "float32",
    "Upper 95%CI": "float32",
    "Cumulative Median": "float32",
    "Cumulative Lower 95%CI": "float32",
    "Cumulative Upper 95%CI": "float32",
    "source_main": "int32",
    "source_sec": "int32",
    "Timestep": "int32",
}


def load_tsv(filename: str) -> pd.DataFrame:
    df = pd.read_csv(filename, sep="\t", dtype=DTYPES)
    df.index = df.index.astype(int)
    splt = filename.split("/")
    first, second = splt[2].split(".")[0].split("-")
    df["source_main"] = pd.Series(int(first), index=df.index, dtype="int32")
    df["source_sec"] = pd.Series(int(second), index=df.index, dtype="int32")
    df["area_type"] = pd.Series(splt[1], index=df.index, dtype="category")
    return df


with Pool(cpu_count()) as p:
    future = p.map_async(load_tsv, all_files)
    res = future.get()
    dfs = pd.concat(res, ignore_index=True).assign(
        area_type=lambda x: x["area_type"].astype("category")
    )

print(f"Processing took {round(time.time() - start)}s. Saving now to {outfile}...")
dfs.info()
dfs.to_parquet(outfile, compression="snappy")
