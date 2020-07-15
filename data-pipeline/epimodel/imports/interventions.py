import pandas as pd


INTERVENTION_TYPES = [
    "Mask Wearing",
    "Symptomatic Testing",
    "Gatherings <1000",
    "Gatherings <100",
    "Gatherings <10",
    "Some Businesses Suspended",
    "Most Businesses Suspended",
    "School Closure",
    "Stay Home Order",
    "Travel Screen/Quarantine",
    "Travel Bans",
    "Public Transport Limited",
    "Internal Movement Limited",
    "Public Information Campaigns",
]


def create_intervetions_dict(json_path: str):
    df = pd.read_csv(json_path)
    df = df[["Country Code", "Date"] + INTERVENTION_TYPES]

    canceled_interventions = []
    for intervention_type in INTERVENTION_TYPES:
        canceled_name = f"CANCELED {intervention_type}"
        canceled_interventions.append(canceled_name)
        df[canceled_name] = df.groupby("Country Code")[intervention_type].transform(
            invert_col
        )

    df["interventions"] = df[INTERVENTION_TYPES + canceled_interventions].apply(
        lambda x: set(x.keys()[x.values.astype(bool)]), axis=1
    )
    return df.groupby("Country Code").apply(process_country).to_dict()["Interventions"]


def invert_col(country_intervention):
    on_idx = country_intervention[(country_intervention == 1.0)]
    first_time_on = (
        on_idx.idxmax() if on_idx.count() > 0 else country_intervention.index.max()
    )
    cancled = (~country_intervention.astype(bool)).astype(float)
    cancled[cancled.index <= first_time_on] = 0.0

    return cancled


def process_country(country_df):
    interventions = []
    last = None
    for i, row in country_df.sort_values(by="Date").iterrows():
        if last is None:
            if len(row["interventions"]):
                last = {
                    "type": row["interventions"],
                    "dateStart": row["Date"],
                    "dateEnd": None,
                }
        else:
            row_interventions = row["interventions"]
            if last["type"] != row_interventions:
                last["type"] = list(last["type"])
                last["dateEnd"] = row["Date"]
                interventions.append(last)
                if len(row_interventions):
                    last = {
                        "type": row["interventions"],
                        "dateStart": row["Date"],
                        "dateEnd": None,
                    }
                else:
                    last = {"type": [], "dateStart": row["Date"], "dateEnd": None}

    return pd.Series({"Interventions": interventions})
