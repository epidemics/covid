import argparse
import os
import re
import glob
import os.path
import time
from multiprocessing import cpu_count
from multiprocessing.pool import Pool
import pandas as pd
from io import StringIO
from datetime import datetime

from preselect_cities import process_data

DATE_FORMAT = "%Y-%m-%d"

MDS = [
    "md_cities.tsv",
    "md_continents.tsv",
    "md_countries.tsv",
    "md_hemispheres.tsv",
    "md_regions.tsv",
]


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


def read_tsv(path):
    return pd.read_csv(path, sep="\t")


def tsv_to_df(filetuple: tuple) -> pd.DataFrame:
    filestr = StringIO(filetuple[1])
    df = pd.read_csv(filestr, sep="\t", dtype=DTYPES)
    df.index = df.index.astype(int)
    splt = filetuple[0].split("/")
    first, second = splt[-1].split(".")[0].split("-")
    df["source_main"] = pd.Series(int(first), index=df.index, dtype="int32")
    df["source_sec"] = pd.Series(int(second), index=df.index, dtype="int32")
    df["area_type"] = pd.Series(splt[-2], index=df.index, dtype="category")
    return df


def map_to_dfs(all_files: dict) -> pd.DataFrame:
    print(f"Going to process {len(all_files)} files...")

    start = time.time()

    with Pool(cpu_count()) as p:
        future = p.map_async(tsv_to_df, all_files.items())
        res = future.get()
        df = pd.concat(res, ignore_index=True).assign(
            area_type=lambda x: x["area_type"].astype("category")
        )

    print(f"Processing took {round(time.time() - start)}s.")

    return df


def fix_md_file(md):
    s = ""
    with open(md) as ifile:
        header = next(ifile).strip().split("\t")
        s += "\t".join(header[1:]) + "\n"
        for line in ifile:
            if len(line.split("\t")) > len(header):
                m = re.findall(r"[0-9]+", line)
                counter = int(m[0])
                ls = [m[0]]
                for i in m:
                    if int(i) == counter + 1:
                        ls.append(str(i))
                        counter += 1
                indexes = [line.index(ix) for ix in ls]
                new_line = ""
                for en, ix in enumerate(indexes):
                    end = en + 1 if en < len(indexes) - 1 else None
                    new_line += (
                        line[indexes[en] : indexes[end] if end else None].rstrip()
                        + "\n"
                    )
                s += new_line.lstrip()
            else:
                s += line.lstrip()
    return s


def fix_tsv_file(tsv):
    s = ""
    with open(tsv) as ifile:
        header = next(ifile).replace("#", "").strip()
        s += header + "\n"
        for line in ifile:
            s += line.lstrip()

    return s


def get_model_start_date(filepath):
    with open(filepath, "r") as f:
        definition = f.read()

    m = re.search('startDate="(.*?)"', definition)
    start_date = m.group(1)
    start_date = datetime.strptime(start_date, DATE_FORMAT)
    return start_date


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("directory", help="Directory with the gleamviz exported data")
    parser.add_argument("outdir", help="Output directory")
    parser.add_argument("city_selection", help="tsv file with selected cities")
    args = parser.parse_args()

    mds = [os.path.join(args.directory, md) for md in MDS]
    mds = {filename: fix_md_file(filename) for filename in mds}
    print("MDs processed")

    data_files = glob.glob(os.path.join(args.directory, "*/*.tsv"))

    data_files = {filename: fix_tsv_file(filename) for filename in data_files}
    print("TSVs processed")

    data_df = map_to_dfs(data_files)
    data_df.info()

    md_dfs = {
        k.split("/")[-1].split(".")[0]: pd.read_csv(StringIO(v), sep="\t")
        for k, v in mds.items()
    }
    print("DFs mapped", data_df.shape)

    city_selection = read_tsv(args.city_selection)
    print("City selection loaded")

    processed_data = process_data(md_dfs["md_cities"], city_selection, data_df)

    if not os.path.exists(args.outdir):
        os.makedirs(args.outdir)

    definition_filepath = os.path.join(args.directory, "definition.xml")
    start_date = get_model_start_date(definition_filepath)

    target_filepath = os.path.join(args.outdir, "covid_data.hdf")

    # save lookup table
    processed_data.to_hdf(target_filepath, key="data/city_lookup")

    # save metadata
    pd.Series({"start_date": start_date}).to_hdf(
        target_filepath, key="metadata/model_info"
    )

    print("Data saved to: " + target_filepath)
