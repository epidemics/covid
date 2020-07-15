import pandas as pd


def extend_countermeasure_data(
    countermeasures_path: str, johns_hopkins_path: str, extension_period: int,
) -> pd.DataFrame:
    df = pd.read_csv(countermeasures_path)
    jh_df = pd.read_csv(johns_hopkins_path)
    jh_groups = jh_df.groupby("Code")

    return df.groupby("Country Code").apply(
        lambda ctm_df: extend_country_countermeasures(
            ctm_df, jh_groups.get_group(ctm_df.name), extension_period
        )
    )


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
