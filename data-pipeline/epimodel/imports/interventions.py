import pandas as pd


INTERVENTION_TYPES = [
    "Healthcare Infection Control",
    "Mask Wearing",
    "Symptomatic Testing",
    "Gatherings <1000",
    "Gatherings <100",
    "Gatherings <10",
    "Some Businesses Suspended",
    "Most Businesses Suspended",
    "School Closure",
    "Stay Home Order",
]


def create_intervetions_dict(json_path: str):
    df = pd.read_csv(json_path)
    df = df[["Country Code", "Date"] + INTERVENTION_TYPES]
    df["interventions"] = df[INTERVENTION_TYPES].apply(
        lambda x: set(x.keys()[x.values.astype(bool)]), axis=1
    )
    return df.groupby("Country Code").apply(process_country).to_dict()["Interventions"]


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
