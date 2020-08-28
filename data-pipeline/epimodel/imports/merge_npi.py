import logging
import pandas as pd
import numpy as np

from typing import List

log = logging.getLogger(__name__)

OxCGRT_TRANSFORM_CONFIG = {
    "Symptomatic Testing": [("H2_Testing policy", 2)],
    "Gatherings <1000": [("C4_Restrictions on gatherings", 2), ("C4_Flag", 1)],
    "Gatherings <100": [("C4_Restrictions on gatherings", 3), ("C4_Flag", 1)],
    "Gatherings <10": [("C4_Restrictions on gatherings", 4), ("C4_Flag", 1)],
    "Some Businesses Suspended": [("C2_Workplace closing", 2), ("C2_Flag", 1)],
    "Most Businesses Suspended": [("C2_Workplace closing", 3), ("C2_Flag", 1)],
    "School Closure": [("C1_School closing", 3), ("C1_Flag", 1)],
    "Stay Home Order": [("C6_Stay at home requirements", 2), ("C6_Flag", 1)],
}

NPI_NAMES = [
    "Mask Wearing",
    "Symptomatic Testing",
    "Gatherings <1000",
    "Gatherings <100",
    "Gatherings <10",
    "Some Businesses Suspended",
    "Most Businesses Suspended",
    "School Closure",
    "University Closure",
    "Stay Home Order",
    "Travel Screen/Quarantine",
    "Travel Bans",
    "Public Transport Limited",
    "Internal Movement Limited",
    "Public Information Campaigns",
]


def merge_npi_datasets(
    countermeasures_path: str,
    oxcgrt_path: str,
    johns_hopkins_path: str,
    add_canceled_npi_features: bool,
    drop_npi: List[str],
) -> pd.DataFrame:
    countermeasures_df = pd.read_csv(countermeasures_path, parse_dates=["Date"])
    oxcgrt_df = pd.read_csv(oxcgrt_path, parse_dates=["Date"])
    johns_hopkins_df = pd.read_csv(johns_hopkins_path, parse_dates=["Date"])

    oxcgrt_df = _filter_out_subregions(oxcgrt_df)
    oxcgrt_df = _oxcgrt_to_npi_features(oxcgrt_df)

    index = _get_index(countermeasures_df, johns_hopkins_df, oxcgrt_df)

    log.info(
        f"Merging NPI data. Exporting data from {index.get_level_values('Date').min()} to "
        f"{index.get_level_values('Date').max()} for the following regions:\n"
        f"{list(index.unique('Country Code'))}"
    )

    countermeasures_reindexed = _reindex_and_fill(
        countermeasures_df.set_index(["Country Code", "Date"]), index
    )
    oxcgrt_reindexed = _reindex_and_fill(
        oxcgrt_df.set_index(["Country Code", "Date"]), index
    )
    johns_hopkins_reindexed = johns_hopkins_df.set_index(["Code", "Date"]).reindex(
        index
    )

    merged = countermeasures_reindexed.combine_first(
        johns_hopkins_reindexed
    ).combine_first(oxcgrt_reindexed)

    npi_names = [npi for npi in NPI_NAMES if npi not in drop_npi]
    column_names = [col for col in countermeasures_df.columns if col not in drop_npi]

    if add_canceled_npi_features:
        for intervention in npi_names:
            canceled_name = f"CANCELED {intervention}"
            merged[canceled_name] = merged.groupby(level="Country Code")[
                intervention
            ].transform(add_canceled_interventions)
            column_names.append(canceled_name)

    return merged.reset_index()[column_names].set_index("Country Code")


def _oxcgrt_to_npi_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.set_index(
        [
            "Country Code",
            "Date",
            "Region Name",
        ]
    )

    features = {}
    for npi_feature, oxcgrt_cols in OxCGRT_TRANSFORM_CONFIG.items():
        cols = []
        for col_name, value in oxcgrt_cols:
            cols.append(df[col_name] >= value)
        features[npi_feature] = pd.DataFrame(cols).all().astype(float)

    missing_cols = set(NPI_NAMES).difference(features.keys())
    oxcgrt_npis = pd.DataFrame(features).reset_index()
    oxcgrt_npis.loc[:, missing_cols] = np.nan

    return oxcgrt_npis


def _filter_out_subregions(df: pd.DataFrame) -> pd.DataFrame:
    return df[df["RegionCode"].isna()]


def _get_index(
    countermeasures_df: pd.DataFrame,
    johns_hopkins_df: pd.DataFrame,
    oxcgrt_df: pd.DataFrame,
) -> pd.MultiIndex:
    exported_countries = _get_index_country_codes(
        countermeasures_df, johns_hopkins_df, oxcgrt_df
    )
    date_range = _get_index_date_range(countermeasures_df, johns_hopkins_df, oxcgrt_df)

    return pd.MultiIndex.from_product(
        [pd.Index(exported_countries), date_range],
        sortorder=0,
        names=["Country Code", "Date"],
    )


def _get_index_country_codes(
    countermeasures_df: pd.DataFrame,
    johns_hopkins_df: pd.DataFrame,
    oxcgrt_df: pd.DataFrame,
) -> List[str]:
    oxcgrt_codes = set(oxcgrt_df["Country Code"].dropna())
    jh_codes = set(johns_hopkins_df["Code"].dropna())
    countermeasures_codes = set(countermeasures_df["Country Code"].dropna())

    # return sorted(countermeasures_codes.union(oxcgrt_codes).intersection(jh_codes))
    # Use just the original 40 countries from the paper, we will use explicit list of countries in the future
    return list(countermeasures_codes.intersection(jh_codes))


def _get_index_date_range(
    countermeasures_df: pd.DataFrame,
    johns_hopkins_df: pd.DataFrame,
    oxcgrt_df: pd.DataFrame,
) -> pd.DatetimeIndex:
    min_date = max(
        johns_hopkins_df["Date"].min(),
        min(countermeasures_df["Date"].min(), oxcgrt_df["Date"].min()),
    )
    max_date = min(
        johns_hopkins_df["Date"].max(),
        oxcgrt_df["Date"].max(),
    )

    return pd.date_range(min_date, max_date)


def _reindex_and_fill(df: pd.DataFrame, index: pd.MultiIndex) -> pd.DataFrame:
    return df.reindex(index).groupby(level="Country Code").apply(_fill_regions)


def _fill_regions(region_df: pd.DataFrame) -> pd.DataFrame:
    region_df["Region Name"] = region_df["Region Name"].ffill().bfill()
    return region_df


def add_canceled_interventions(country_intervention):
    on_mask = country_intervention[(country_intervention == 1.0)]
    first_time_on = (
        on_mask.idxmax() if on_mask.count() > 0 else country_intervention.index.max()
    )[1]
    cancled = (~country_intervention.astype(bool)).astype(float)
    cancled[country_intervention.isna()] = np.nan
    cancled[country_intervention.index.get_level_values("Date") <= first_time_on] = 0.0

    return cancled
