import datetime
import getpass
import socket
import logging
import json
import shutil
from pathlib import Path

import numpy as np
import pandas as pd

from typing import Dict, Optional, List, Any

from ..regions import Region, RegionDataset
from . import types_to_json, get_df_else_none

log = logging.getLogger(__name__)


class NPIModelExport:
    """
    Document holding one data export to web. Contains a subset of Regions.
    """

    def __init__(self, date_resample: str, comment=None):
        self.created = datetime.datetime.now().astimezone(datetime.timezone.utc)
        self.created_by = f"{getpass.getuser()}@{socket.gethostname()}"
        self.comment = comment
        self.date_resample = date_resample
        self.export_regions: Dict[str, NPIModelExportRegion] = {}

    def to_json(self):
        return {
            "created": self.created,
            "created_by": self.created_by,
            "comment": self.comment,
            "date_resample": self.date_resample,
            "regions": {
                region: export.to_json()
                for region, export in self.export_regions.items()
            },
        }

    def new_region(
        self, region: Region, npi_model: pd.DataFrame, extrapolation_date: pd.Timestamp
    ) -> "NPIModelExportRegion":

        export_region = NPIModelExportRegion(region, npi_model, extrapolation_date)

        self.export_regions[region.Code] = export_region
        return export_region

    def write(
        self,
        main_data_path: Path,
        latest: Optional[Path] = None,
        overwrite=False,
        indent=None,
    ):

        main_data_path.parent.mkdir(parents=True, exist_ok=True)

        log.info(f"Writing NPIExport to {main_data_path} ...")

        if not overwrite and main_data_path.exists():
            raise RuntimeError(
                "The export already exists, overwrite it by specifying the --overwrite flag"
            )

        with main_data_path.open("wt") as f:
            json.dump(
                self.to_json(),
                f,
                default=types_to_json,
                allow_nan=False,
                separators=(",", ":"),
                indent=indent,
            )
            log.info(
                f"Exported NPI model results for {len(self.export_regions)} to {main_data_path}"
            )

        if latest is not None:
            shutil.copy(main_data_path, latest)
            log.info(f"Copied the NPI model export to {latest}")


class NPIModelExportRegion:
    def __init__(
        self,
        region: Region,
        npi_model: Optional[pd.DataFrame],
        extrapolation_date: pd.Timestamp,
    ):
        log.debug(f"Prepare WebExport: {region.Code}, {region.Name}")

        self.region = region

        if npi_model is not None:
            npi_model = npi_model.set_index("Date").sort_index()
            self.data = self.extract_data(npi_model, extrapolation_date)
        else:
            log.warning(f"No NPI model results for region {region.Name}")
            self.data = {}

    def extract_data(
        self, npi_model: pd.DataFrame, extrapolation_date: pd.Timestamp
    ) -> Dict[str, Any]:
        data = {
            "Date": [x.isoformat() for x in npi_model.index],
            "ExtrapolationDate": extrapolation_date.isoformat(),
            **npi_model.replace({np.nan: None}).to_dict(orient="list"),
        }

        return data

    def to_json(self):
        d = {
            "data": self.data,
            "Name": self.region.DisplayName,
        }

        return d


def process_model_export(
    inputs: Dict[str, Any],
    rds: RegionDataset,
    comment: str,
    config: Dict[str, Any],
    resample: str,
) -> NPIModelExport:
    ex = NPIModelExport(resample, comment)

    countermeasures = inputs["model_data"].path
    npi_model_results = inputs["npi_model"].path

    export_regions = sorted(config["export_regions"])

    countermeasures_df = pd.read_csv(
        countermeasures,
        index_col=["Country Code", "Date"],
        parse_dates=["Date"],
        keep_default_na=False,
        na_values=[""],
    )

    npi_model_results_df: pd.DataFrame = pd.read_csv(
        npi_model_results,
        index_col=["Code"],
        parse_dates=["Date"],
        keep_default_na=False,
        na_values=[""],
    )

    extrapolation_date = get_extrapolation_date(countermeasures_df)

    for code in export_regions:
        reg: Region = rds[code]

        ex.new_region(
            reg, get_df_else_none(npi_model_results_df, code), extrapolation_date,
        )

    return ex


def get_extrapolation_date(countermeasures_df: Optional[pd.DataFrame]):
    if countermeasures_df is not None:
        return countermeasures_df.index.get_level_values(
            "Date"
        ).max() + datetime.timedelta(days=1)
    else:
        return None
