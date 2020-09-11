import logging
import pandas as pd

log = logging.getLogger(__name__)

RENAME_COLUMNS = {
    "CountryCode": "Country Code",
    "CountryName": "Region Name",
}

DROP_COLUMNS = [
    "ConfirmedCases",
    "ConfirmedDeaths",
    "StringencyIndex",
    "StringencyIndexForDisplay",
    "StringencyLegacyIndex",
    "StringencyLegacyIndexForDisplay",
    "GovernmentResponseIndex",
    "GovernmentResponseIndexForDisplay",
    "ContainmentHealthIndex",
    "ContainmentHealthIndexForDisplay",
    "EconomicSupportIndex",
    "EconomicSupportIndexForDisplay",
]

INDEX_COLUMNS = ["Country Code", "Date", "Region Name"]

SPECIAL_ISO_CODE_MAPPINGS = {
    "HKG": "HK",
    "MAC": "MO",
    "NAM": "NA",
    "RKS": "XK",
}

GITHUB_URL = "https://raw.githubusercontent.com/OxCGRT/covid-policy-tracker/master/data/OxCGRT_latest.csv"


def import_oxford_government_response_tracker(regions: str, url=GITHUB_URL):
    """

    :param regions:
    :param url:
    :return:
    """
    log.info(f"Downloading OxCGRT data from {GITHUB_URL}")
    df = pd.read_csv(
        url, dtype="U", usecols=lambda x: x not in DROP_COLUMNS, parse_dates=["Date"]
    )

    df = df.rename(columns=RENAME_COLUMNS)
    df["Date"] = df["Date"].dt.tz_localize("UTC")

    return iso3_code_to_iso2(df, regions).set_index(INDEX_COLUMNS)


def iso3_code_to_iso2(df: pd.DataFrame, regions: str) -> pd.DataFrame:
    regions_df = pd.read_csv(regions)
    codes = regions_df.set_index("CountryCodeISOa3")["Code"]
    iso3_to_iso2 = codes[~codes.str.contains("-", regex=False, na=True)].to_dict()

    iso3_to_iso2.update(SPECIAL_ISO_CODE_MAPPINGS)
    df["Country Code"] = df["Country Code"].transform(lambda code: iso3_to_iso2[code])

    return df
