import copy
from typing import List
from pandas import Timestamp
from datetime import timedelta

import pandas as pd
import numpy as np
import theano
import scipy.signal as ss

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataPreprocessor:
    def __init__(self, *args, **kwargs):
        self.min_confirmed = 100
        self.min_deaths = 10

        self.mask_zero_deaths = False
        self.mask_zero_cases = False

        self.smooth = True
        self.N_smooth = 5

        self.drop_HS = False

        for key in kwargs:
            setattr(self, key, kwargs[key])

    def generate_params_dict(self):
        return {
            "min_final_num_active_cases": self.min_final_num_active_cases,
            "confirmed_mask": self.min_num_active_mask,
        }

    def preprocess_data(self, data_path, extrapolation_period=31):
        # load data
        df = pd.read_csv(
            data_path, parse_dates=["Date"], infer_datetime_format=True
        ).set_index(["Country Code", "Date"])
        Ds = list(df.index.levels[1])
        Ds += [max(Ds) + timedelta(days=days+1) for days in range(extrapolation_period)]
        nDs = len(Ds)

        all_rs = list([r for r, _ in df.index])
        regions = list(df.index.levels[0])
        locations = [all_rs.index(r) for r in regions]
        sorted_regions = [r for l, r in sorted(zip(locations, regions))]
        nRs = len(sorted_regions)
        region_names = copy.deepcopy(sorted_regions)
        region_full_names = df.loc[region_names]["Region Name"]

        if self.drop_HS:
            logger.info("Dropping Healthcare Infection Control")
            df = df.drop("Healthcare Infection Control", axis=1)

        countermeasures = list(df.columns[4:])
        num_countermeasures = len(countermeasures)

        active_countermeasures = np.zeros((nRs, num_countermeasures, nDs))
        confirmed = np.zeros((nRs, nDs))
        deaths = np.zeros((nRs, nDs))
        active = np.zeros((nRs, nDs))
        new_deaths = np.zeros((nRs, nDs))
        new_cases = np.zeros((nRs, nDs))

        for r_i, r in enumerate(sorted_regions):
            region_names[r_i] = df.loc[(r, Ds[0])]["Region Name"]
            for d_i, d in enumerate(Ds[:-extrapolation_period]):
                confirmed[r_i, d_i] = df.loc[(r, d)]["Confirmed"]
                deaths[r_i, d_i] = df.loc[(r, d)]["Deaths"]
                active[r_i, d_i] = df.loc[(r, d)]["Active"]

                active_countermeasures[r_i,:, :-extrapolation_period] = (
                    df.loc[r].loc[Ds[:-extrapolation_period]][countermeasures].values.T
                )

        # preprocess data
        confirmed[confirmed < self.min_confirmed] = np.nan
        deaths[deaths < self.min_deaths] = np.nan
        new_cases[:, 1:] = confirmed[:, 1:] - confirmed[:, :-1]
        new_deaths[:, 1:] = deaths[:, 1:] - deaths[:, :-1]
        new_deaths[new_deaths < 0] = 0
        new_cases[new_cases < 0] = 0

        new_cases[np.isnan(new_cases)] = 0
        new_deaths[np.isnan(new_deaths)] = 0

        logger.info("Performing Smoothing")
        if self.smooth:
            smoothed_new_cases = np.around(
                ss.convolve2d(
                    new_cases,
                    1 / self.N_smooth * np.ones(shape=(1, self.N_smooth)),
                    boundary="symm",
                    mode="same",
                )
            )
            smoothed_new_deaths = np.around(
                ss.convolve2d(
                    new_deaths,
                    1 / self.N_smooth * np.ones(shape=(1, self.N_smooth)),
                    boundary="symm",
                    mode="same",
                )
            )
            for r in range(nRs):
                # if the country has too few deaths, ignore
                if deaths[r, -1] < 50:
                    logger.info(f"Skipping smoothing {region_names[r]}")
                    smoothed_new_deaths[r, :] = new_deaths[r, :]

            new_cases = smoothed_new_cases
            new_deaths = smoothed_new_deaths

        logger.info("Performing Masking")
        if self.mask_zero_deaths:
            new_deaths[new_deaths < 1] = np.nan
        else:
            new_deaths[new_deaths < 0] = np.nan

        if self.mask_zero_cases:
            new_cases[new_cases < 1] = np.nan
        else:
            new_cases[new_cases < 0] = np.nan

        confirmed = np.ma.masked_invalid(confirmed.astype(theano.config.floatX))
        active = np.ma.masked_invalid(active.astype(theano.config.floatX))
        deaths = np.ma.masked_invalid(deaths.astype(theano.config.floatX))
        new_deaths = np.ma.masked_invalid(new_deaths.astype(theano.config.floatX))
        new_cases = np.ma.masked_invalid(new_cases.astype(theano.config.floatX))
        return PreprocessedData(
            active,
            confirmed,
            active_countermeasures,
            countermeasures,
            sorted_regions,
            Ds,
            deaths,
            new_deaths,
            new_cases,
            region_full_names,
        )


class PreprocessedData:
    def __init__(
        self,
        Active: np.ndarray,
        Confirmed: np.ndarray,
        ActiveCMs: np.ndarray,
        CMs: List[str],
        Rs: List[str],
        Ds: List[Timestamp],
        Deaths: np.ndarray,
        NewDeaths: np.ndarray,
        NewCases: np.ndarray,
        RNames: np.ndarray,
    ):
        self.Active = Active
        self.Confirmed = Confirmed
        self.Deaths = Deaths
        self.ActiveCMs = ActiveCMs
        self.Rs = Rs
        self.CMs = CMs
        self.Ds = Ds
        self.NewDeaths = NewDeaths
        self.NewCases = NewCases
        self.RNames = RNames

    def reduce_regions_from_index(self, reduced_regions_index):
        self.Active = self.Active[reduced_regions_index, :]
        self.Confirmed = self.Confirmed[reduced_regions_index, :]
        self.Deaths = self.Deaths[reduced_regions_index, :]
        self.NewDeaths = self.NewDeaths[reduced_regions_index, :]
        self.NewCases = self.NewCases[reduced_regions_index, :]
        self.ActiveCMs = self.ActiveCMs[reduced_regions_index, :, :]

    def filter_region_min_deaths(self, min_num_deaths=100):
        reduced_regions = []
        reduced_regions_index = []
        for index, r in enumerate(self.Rs):
            if self.Deaths.data[index, -1] < min_num_deaths:
                logger.warning(
                    f"Region {r} removed since it has {self.Deaths[index, -1]} deaths on the last day"
                )
            elif np.isnan(self.Deaths.data[index, -1]):
                logger.warning(
                    f"Region {r} removed since it has {self.Deaths[index, -1]} deaths on the last day"
                )
            else:
                reduced_regions.append(r)
                reduced_regions_index.append(index)

        self.Rs = reduced_regions
        self.reduce_regions_from_index(reduced_regions_index)

    def filter_regions(self, regions_to_remove):
        reduced_regions = []
        reduced_regions_index = []
        for index, r in enumerate(self.Rs):
            if r in regions_to_remove:
                pass
            else:
                reduced_regions_index.append(index)
                reduced_regions.append(r)

        self.Rs = reduced_regions
        _, nCMs, nDs = self.ActiveCMs.shape
        self.reduce_regions_from_index(reduced_regions_index)

    def ignore_feature(self, f_i):
        self.ActiveCMs[:, f_i, :] = 0

    def ignore_early_features(self):
        for r in range(len(self.Rs)):
            for f_i, f in enumerate(self.CMs):
                if f_i == 0:
                    if np.sum(self.ActiveCMs[r, f_i, :]) > 0:
                        # i.e., if the feature is turned on.
                        nz = np.nonzero(self.ActiveCMs[r, f_i, :])[0]
                        # if the first day that the feature is on corresponds to a masked day. this is conservative
                        if np.isnan(self.Confirmed.data[r, nz[0]]):
                            self.ActiveCMs[r, f_i, :] = 0
                            logger.warning(
                                f"Region {self.Rs[r]} has feature {f} removed, since it is too early"
                            )
