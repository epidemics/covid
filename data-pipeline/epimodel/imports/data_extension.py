import pandas as pd
from .common import INTERVENTION_TYPES


def expand_countermeasure_data(
    countermeasures_path: str, johns_hopkins_path: str, extension_period: int,
) -> pd.DataFrame:
    df = pd.read_csv(countermeasures_path)
    jh_df = pd.read_csv(johns_hopkins_path)
    jh_groups = jh_df.groupby("Code")

    extended_df = df.groupby("Country Code").apply(
        lambda ctm_df: extend_country_countermeasures(
            ctm_df, jh_groups.get_group(ctm_df.name), extension_period
        )
    )
    extended_df.reset_index(inplace=True, drop=True)

    for intervention_type in INTERVENTION_TYPES:
        extended_df[f"CANCELED {intervention_type}"] = extended_df.groupby(
            "Country Code"
        )[intervention_type].transform(add_canceled_interventions)

    return extended_df.set_index(["Country Code", "Date"])


def extend_country_countermeasures(
    ctm_df: pd.DataFrame, jh_df: pd.DataFrame, extension_period=30
) -> pd.DataFrame:
    last_row = ctm_df.loc[pd.to_datetime(ctm_df["Date"]).idxmax(), :]
    last_datetime = pd.to_datetime(last_row["Date"])

    df = ctm_df.append(
        pd.DataFrame(
            {
                "Date": [
                    str(last_datetime + pd.DateOffset(days=day + 1))
                    for day in range(extension_period)
                ]
            }
        ),
        ignore_index=True,
    )

    extended_rows = df[pd.to_datetime(df["Date"]) > last_datetime]
    jh_time_idx = pd.to_datetime(jh_df["Date"])
    jh_extension_period_mask = (last_datetime < jh_time_idx) & (
        jh_time_idx <= last_datetime + pd.DateOffset(days=extension_period)
    )
    jh_extension = jh_df[jh_extension_period_mask].set_index(extended_rows.index)

    df.update(jh_extension)
    df.fillna(method="ffill", inplace=True)

    return df


def add_canceled_interventions(country_intervention):
    on_idx = country_intervention[(country_intervention == 1.0)]
    first_time_on = (
        on_idx.idxmax() if on_idx.count() > 0 else country_intervention.index.max()
    )
    cancled = (~country_intervention.astype(bool)).astype(float)
    cancled[cancled.index <= first_time_on] = 0.0

    return cancled
