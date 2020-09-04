from typing import List
from tempfile import NamedTemporaryFile
import os
from subprocess import Popen
import pandas as pd

from epimodel.imports.johns_hopkins import aggregate_countries
from epimodel.regions import RegionDataset

project_dir = os.path.join(os.path.dirname(__file__), "../..")
script_dir = os.path.join(project_dir, "scripts")


def preprocess_hopkins(
    hopkins_file: str,
    rds: RegionDataset,
    state_to_country: List[str],
) -> pd.DataFrame:
    preprocessed = pd.read_csv(
        hopkins_file,
        index_col=["Code", "Date"],
        parse_dates=["Date"],
        keep_default_na=False,
        na_values=[""],
    ).pipe(aggregate_countries, state_to_country, rds)
    preprocessed["Population"] = [
        rds.get(x).Population for x in preprocessed.index.get_level_values("Code")
    ]
    enough_data_mask = (
        preprocessed.groupby("Code")
        .last()
        .loc[lambda row: row["Confirmed"] > 500]
        .index
    )
    return preprocessed.loc[enough_data_mask]


def estimate_r(
    r_script_executable: str,
    output_file: str,
    john_hopkins_csv: str,
    serial_interval_sample: str,
    rds: RegionDataset,
    state_to_country: List[str],
):
    hopkins_df = preprocess_hopkins(john_hopkins_csv, rds, state_to_country)
    with NamedTemporaryFile(mode="w+") as hopkins_file:
        hopkins_df.to_csv(hopkins_file)

        process = Popen(
            [
                r_script_executable,
                os.path.join(script_dir, "estimate_R.R"),
                serial_interval_sample,
                hopkins_file.name,
                output_file,
            ]
        )
        _ = process.communicate()
        rc = process.returncode
        if rc != 0:
            raise RuntimeError("Could not estimate R")

        masked_estimates = mask_not_enough_data(
            pd.read_csv(output_file, parse_dates=["Date"]), hopkins_df, 10
        )
        columns = ["MeanR", "StdR", "EnoughData"]

        masked_estimates[columns].to_csv(output_file)


def mask_not_enough_data(
    r_estimates: pd.DataFrame,
    hopkins_df: pd.DataFrame,
    min_daily_cases: int,
) -> pd.DataFrame:
    hopkins_grouped = hopkins_df.groupby("Code")
    return r_estimates.groupby("Code").apply(
        lambda group: mask_country_not_enough_data(
            group, hopkins_grouped.get_group(group.name), min_daily_cases
        )
    )


def mask_country_not_enough_data(
    country_estimates: pd.DataFrame,
    hopkins_df: pd.DataFrame,
    min_daily_cases: int,
) -> pd.DataFrame:

    hopkins_df = hopkins_df.reset_index().set_index("Date")
    country_estimates = country_estimates.set_index("Date").tz_localize("UTC")

    enough_data = (
        hopkins_df["Confirmed"]
        .diff()
        .rolling(7, min_periods=0)
        .apply(lambda window: window.sum() / window.size > min_daily_cases)
        .astype(bool)
    )

    country_estimates["EnoughData"] = 0

    country_estimates.loc[enough_data[country_estimates.index].values, "EnoughData"] = 1

    return country_estimates
