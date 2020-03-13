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

DATE_FORMAT = "%Y-%m-%d"

OUTPUT_FILENAME = "covid_data.hdf"
CITY_LOOKUP_KEY = "data/city_lookup"
MODEL_START_DATE_KEY = "metadata/model_info"

TIME_COL = "Timestep"
TARGET_COL = "Cumulative Median"

MOCKING_CONSTANT = 10

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


def read_metadata(directory):
    mds = [os.path.join(directory, md) for md in MDS]
    mds = {filename: fix_md_file(filename) for filename in mds}
    print("MDs processed")

    # parse MD files
    md_dfs = {
        k.split("/")[-1].split(".")[0]: pd.read_csv(StringIO(v), sep="\t")
        for k, v in mds.items()
    }

    definition_filepath = os.path.join(directory, "definition.xml")
    start_date = get_model_start_date(definition_filepath)

    return md_dfs, start_date


def preprocess_data(all_data, all_cities, selected_cities):
    all_data = all_data[all_data["area_type"] == "cities"]

    # find intersection based on names
    selected_cities = all_cities.merge(
        selected_cities, left_on=["City Name"], right_on=["City"], how="inner"
    )
    # find intersection based on City IDs
    selected_cities = all_data.merge(
        selected_cities, left_on="source_main", right_on="City ID", how="inner"
    )
    # select only the files 1 and 3
    selected_cities = selected_cities[selected_cities["source_sec"].isin({1, 3})]
    index_cols = ["City", "source_sec"]

    # select only relevant columns
    selected_cities = selected_cities[index_cols + [TARGET_COL, TIME_COL]]

    # preprocessing step according to David Johnston
    data_1 = (
        selected_cities[selected_cities["source_sec"] == 1]
        .drop(["source_sec"], axis=1)
        .set_index(["City", TIME_COL])
    )
    data_3 = (
        selected_cities[selected_cities["source_sec"] == 3]
        .drop(["source_sec"], axis=1)
        .set_index(["City", TIME_COL])
    )
    selected_cities = data_3 - data_1

    selected_cities = selected_cities.sort_index()

    return selected_cities


def process_model_data(directory, city_metadata, city_selection):
    data_files = glob.glob(os.path.join(directory, "*/*.tsv"))

    print("Processing dir:", directory)

    data_files = {filename: fix_tsv_file(filename) for filename in data_files}
    print("TSVs processed")

    data_df = map_to_dfs(data_files)
    # data_df.info()
    print("DFs mapped")

    processed_data = preprocess_data(data_df, city_metadata, city_selection)

    return processed_data


def process_all_models_data(directories, city_metadata, city_selection):
    # process first dir
    all_data_df = process_model_data(directories[0], city_metadata, city_selection)
    all_data_df[TARGET_COL + "_0"] = all_data_df[TARGET_COL]
    all_data_df = all_data_df.drop(TARGET_COL, axis=1)

    # process all other dirs
    for i, model_dir in enumerate(directories[1:]):
        all_data_df[TARGET_COL + "_" + str(i + 1)] = process_model_data(
            model_dir, city_metadata, city_selection
        )[TARGET_COL]

    return all_data_df


def mock_data(processed_data, mocking_constant):
    print(f"\n\t!!! MOCKING DATA !!! - mocking constant {mocking_constant} added\n")

    for i, col in enumerate(processed_data.columns):
        processed_data[col] = processed_data[col] + i * mocking_constant

    return processed_data


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "directory", help="Directory with multiple gleamviz exported data"
    )
    parser.add_argument("city_selection", help="tsv file with selected cities")
    parser.add_argument(
        "output_file", default=OUTPUT_FILENAME, nargs="?", help="Output file"
    )
    args = parser.parse_args()

    # list subdirectories of directory
    directories = [
        os.path.join(args.directory, model_dir)
        for model_dir in os.listdir(args.directory)
    ]

    # take first of them & read md files & definition file
    md_dfs, start_date = read_metadata(directories[0])

    # read the file with preselected cities
    city_selection = read_tsv(args.city_selection)
    print("City selection loaded")

    all_data_df = process_all_models_data(
        directories, md_dfs["md_cities"], city_selection
    )

    # mock data (currently the data is just copied, so the timeseries will get ocluded in the view)
    all_data_df = mock_data(all_data_df, MOCKING_CONSTANT)

    # save city lookup table
    all_data_df.to_hdf(args.output_file, key=CITY_LOOKUP_KEY)

    # save metadata
    pd.Series({"start_date": start_date}).to_hdf(
        args.output_file, key=MODEL_START_DATE_KEY
    )

    print("Data saved to: " + args.output_file)
