import io
import logging

import numpy as np

import pandas as pd

from ..regions import Region, RegionDataset
from .batch import Batch
from .definition import GleamDefinition

logger = logging.getLogger(__name__)


class NPITriggerConfig:
    def __init__(self, filename=None, text=None):
        assert (filename is None) != (text is None)
        if filename is not None:
            f = filename
        else:
            f = io.StringIO(text)
        df = pd.read_csv(f, header=0, dtype=str, na_values=[], keep_default_na=False)
        df = df.applymap(lambda s: s.strip())
        assert df.columns[0] == "RegionCode"
        assert "Group" in df.columns
        df = df.loc[df.RegionCode != ""]
        for c in df.columns:
            if c not in ("RegionCode", "Group"):
                df[c] = pd.to_numeric(df[c])
        # Verify uniqueness
        _ = df.set_index(["RegionCode", "Group"], verify_integrity=True)

        self.df = df
        logger.info(
            f"Loaded NPI triggers for {len(self.df)} regions: {', '.join(self.df.RegionCode.values)}"
        )

    def create_updated_batch(
        self,
        in_batch: Batch,
        out_batch: Batch,
        rds: RegionDataset,
        truncated_simulations: bool = True,
        window=14,
    ):
        for k in in_batch.hdf.keys():
            if k not in ("/new_fraction", "/triggered_NPIs", "/simulations"):
                out_batch.hdf[k] = in_batch.hdf[k]

        try:
            triggered = in_batch.hdf.get("triggered_NPIs")
        except KeyError:
            triggered = pd.DataFrame(
                {
                    "SimulationID": pd.Series([], dtype=str),
                    "RegionCode": pd.Series([], dtype=str),
                    "Group": pd.Series([], dtype=str),
                    "Trace": pd.Series([], dtype=str),
                    "Day": pd.Series([], dtype=str),
                    "DayNumber": pd.Series([], dtype=np.int32),
                    "Level": pd.Series([], dtype=np.int32),
                }
            )
        sims = in_batch.hdf.get("simulations")
        new_fraction = in_batch.hdf.get("new_fraction")
        new_sims = []
        new_triggered = triggered.copy()
        new_trigger_count = 0

        sim_map = {}
        # For each simulation
        for sim_no, (sid, simrow) in enumerate(sims.iterrows()):
            group = simrow.Group
            definition = GleamDefinition.from_xml_string(simrow.DefinitionXML)
            definition.set_id(int(pd.Timestamp.utcnow().timestamp() * 1000) + sim_no)
            new_sid = definition.get_id_str()
            sim_map[sid] = new_sid

            logger.info(
                f" Triggers for simulation {sid}: group {group!r}, trace {simrow.Trace!r}"
            )
            for _, triggerrow in self.df[self.df.Group == group].iterrows():
                # print(triggerrow, triggered)
                r = triggerrow.RegionCode
                td = triggered.loc[
                    (triggered.RegionCode == r) & (triggered.SimulationID == sid)
                ].sort_values("DayNumber")
                if len(td) > 0:
                    last_level = td.Level.iloc[-1]
                    last_day = td.DayNumber.iloc[-1]
                else:
                    last_level = 0
                    last_day = 0

                pop = rds[r].Population
                up_fraction = (
                    triggerrow.get(f"L{last_level + 1}-Start-14d", np.nan) / pop
                )
                down_fraction = triggerrow.get(f"L{last_level}-Stop-14d", np.nan) / pop

                window_sums = (
                    new_fraction.loc[(sid, r)]
                    .rolling(window, min_periods=0)
                    .sum()
                    .Infected
                )
                assert len(window_sums) == len(new_fraction.loc[(sid, r)].Infected)

                def switch_to_level(day_no, old_level, level):
                    "Perform modifications when level change is detected"
                    nonlocal new_triggered, new_trigger_count
                    day = new_fraction.index.levels[2].values[day_no]
                    logger.info(
                        f"  Triggered in {r}: L{old_level}->L{level} on day {day_no} ({day})"
                    )

                    # Truncate model data at the trigger day (later days are invalid until recompute)
                    if truncated_simulations:
                        new_fraction.loc[
                            (sid, r, slice(day, None)), "Infected"
                        ] = np.nan
                        new_fraction.loc[
                            (sid, r, slice(day, None)), "Recovered"
                        ] = np.nan

                    # Register the trigger
                    # NOTE: Quadratic somplexity, batch inserts if it seems as a problem
                    new_triggered = new_triggered.append(
                        {
                            "SimulationID": new_sid,
                            "Group": group,
                            "Trace": simrow.Trace,
                            "RegionCode": r,
                            "DayNumber": day_no,
                            "Day": str(day),
                            "Level": level,
                        },
                        ignore_index=True,
                    )
                    new_trigger_count += 1

                    # Add exception to new_sims XML
                    # TODO
                    beta = triggerrow[f"L{level}-beta"]
                    definition.add_exception([rds[r]], {"beta": beta}, start=day)

                for i in range(last_day + 1, len(window_sums)):
                    if window_sums[i] > up_fraction:
                        switch_to_level(i, last_level, last_level + 1)
                        break
                    if window_sums[i] < down_fraction:
                        switch_to_level(i, last_level, last_level - 1)
                        break

            # Make a new simulation, set new ID
            definition.format_exceptions()
            new_sims.append(
                {
                    "SimulationID": definition.get_id_str(),
                    "Group": group,
                    "Trace": simrow.Trace,
                    "StartDate": simrow.StartDate,
                    "DefinitionXML": definition.to_xml_string(),
                }
            )

        out_batch.hdf.put(
            "triggered_NPIs",
            new_triggered,
            format="table",
            complib="bzip2",
            complevel=4,
        )
        new_sims = pd.DataFrame(new_sims).set_index("SimulationID")
        out_batch.hdf.put(
            "simulations", new_sims, format="table", complib="bzip2", complevel=4,
        )
        if truncated_simulations:
            new_fraction.rename(index=sim_map, inplace=True)
            out_batch.hdf.put(
                "new_fraction",
                new_fraction,
                format="table",
                complib="bzip2",
                complevel=4,
            )
        logger.info(
            f'All triggers: {new_triggered.sort_values(["Group", "Trace", "RegionCode", "DayNumber"])}'
        )
        logger.info(f">>> Added {new_trigger_count} new triggers")
