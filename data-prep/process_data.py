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

OUTPUT_FILENAME = "line-data.csv"

TIME_COL = "Timestep"
TARGET_COL = "Cumulative Median"

MOCKING_CONSTANT = 10

MITIGATION_COL = "Mitigation"
BETA_PATTERN = 'continents="(.*?)"'
SIM_PARAM_PATTERN = "=(.*?),.*=(.*?),.*=(.*?)$"

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


def map_to_dfs(all_files: dict, mitigation) -> pd.DataFrame:
    print(f"Going to process {len(all_files)} files...")

    start = time.time()

    with Pool(cpu_count()) as p:
        future = p.map_async(tsv_to_df, all_files.items())
        res = future.get()
        df = pd.concat(res, ignore_index=True).assign(
            area_type=lambda x: x["area_type"].astype("category")
        )
        df[MITIGATION_COL] = mitigation
        print("mitigation", mitigation)

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


def preprocess_data(all_data, all_locations, selected_locations):
    all_data = all_data[all_data["area_type"] == "countries"]

    # find intersection based on names
    selected_locations = all_locations.merge(
        # selected_locations, left_on=["City Name"], right_on=["City"], how="inner"
        selected_locations,
        left_on=["Name"],
        right_on=["Country"],
        how="inner",
    )
    # find intersection based on City IDs
    selected_locations = all_data.merge(
        # selected_locations, left_on="source_main", right_on="City ID", how="inner"
        selected_locations,
        left_on="source_main",
        right_on="ID",
        how="inner",
    )
    # select only the files 1 and 3
    selected_locations = selected_locations[
        selected_locations["source_sec"].isin({1, 3})
    ]
    index_cols = ["Country", MITIGATION_COL, "source_sec"]

    # select only relevant columns
    selected_locations = selected_locations[index_cols + [TARGET_COL, TIME_COL]]

    # preprocessing step according to David Johnston
    data_1 = (
        selected_locations[selected_locations["source_sec"] == 1]
        .drop(["source_sec"], axis=1)
        .set_index(["Country", MITIGATION_COL, TIME_COL])
    )
    data_3 = (
        selected_locations[selected_locations["source_sec"] == 3]
        .drop(["source_sec"], axis=1)
        .set_index(["Country", MITIGATION_COL, TIME_COL])
    )
    selected_locations = data_3 - data_1

    selected_locations = selected_locations.sort_index()

    return selected_locations


def parse_simulation_params(directory):
    m = re.search(SIM_PARAM_PATTERN, directory)
    seasonality, air_traffic, mitigation = [float(x) for x in m.groups()]
    return seasonality, air_traffic, mitigation


def process_model_data(directory, locations, selection, mitigation):
    data_files = glob.glob(os.path.join(directory, "*/*.tsv"))

    print("Processing dir:", directory)

    data_files = {filename: fix_tsv_file(filename) for filename in data_files}
    print("TSVs processed")

    data_df = map_to_dfs(data_files, mitigation)
    # data_df.info()
    print("DFs mapped")

    processed_data = preprocess_data(data_df, locations, selection)

    return processed_data


# super ugly & hacky parsing
def get_mitigation_beta(filepath):
    stop = False
    beta = 0
    with open(filepath, "r") as ff:
        for line in ff.readlines():
            if stop:
                m = re.search('<variable value="(.*?)" name="beta"/>', line)
                beta = float(m.group(1))
                break

            # if pattern found, parse the next line
            patt = re.search(BETA_PATTERN, line)
            if patt is not None and patt.group(1) != "":
                stop = True

    return beta


def process_all_models_data(directories, locations, selection):
    res = []

    for i, model_dir in enumerate(directories):
        seasonality, air_traffic, mitigation = parse_simulation_params(model_dir)
        print("parsed sim params:", seasonality, air_traffic, mitigation)

        df = process_model_data(model_dir, locations, selection, mitigation)

        # rename column to include simulation params
        new_col_name = TARGET_COL + f"_s={seasonality}_at={air_traffic}"
        df[new_col_name] = df[TARGET_COL]

        df = df[[new_col_name]]

        res.append(df)

    res = pd.concat(res).reset_index()

    # this removes nans and creates a unique index
    res = res.groupby(["Country", MITIGATION_COL, TIME_COL]).max()

    return res


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "directory", help="Directory with multiple gleamviz exported data"
    )
    parser.add_argument("selection", help="tsv file with selected cities")
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
    selection = read_tsv(args.selection)
    print("Location selection loaded")

    all_data_df = process_all_models_data(
        directories, md_dfs["md_countries"], selection
    )

    # save location lookup table
    all_data_df.to_csv(args.output_file)

    # save metadata
    metadata_name = args.output_file.split(".")
    metadata_name = f"md_{metadata_name[0]}.{metadata_name[1]}"
    pd.Series({"start_date": start_date}).to_csv(metadata_name)

    print("Data saved to: " + args.output_file)
