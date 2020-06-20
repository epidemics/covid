import copy
import logging
from typing import Tuple

import numpy as np
import pymc3 as pm
import theano.tensor as tensor
import theano.tensor.signal.conv as tensor_convolution
from pymc3 import Model
import pandas as pd

from epimodel.pymc3_models.cm_effect.datapreprocessor import PreprocessedData

log = logging.getLogger(__name__)

# taken from Cereda et. al (2020).
# https://arxiv.org/ftp/arxiv/papers/2003/2003.09320.pdf
# alpha is shape, beta is inverse scale (reciprocal reported in the paper).
SI_ALPHA = 1.87
SI_BETA = 0.28


class BaseCMModel(Model):
    def __init__(self, data: PreprocessedData, name: str = "", model: Model = None):
        super().__init__(name, model)
        self.data = data
        self.plot_trace_vars = set()
        self.trace = None

    def create_lognorm(
        self,
        name: str,
        mean: float,
        log_var: float,
        observed=None,
        plot_trace: bool = True,
        shape: Tuple[int, ...] = None,
    ):
        """
        Create a lognorm variable, adding it to self as attribute.
        :param name:
        :param mean: mean of the lognormal distribution
        :param log_var: lognormal variance
        :param observed: ???
        :param plot_trace: ???
        :param shape: ???
        """
        if name in self.__dict__:
            log.warning(f"Variable {name} already present, overwriting def")
        kws = {}
        if shape is not None:
            kws["shape"] = shape
        v = pm.Lognormal(name, mean, log_var, observed=observed, **kws)
        self.__dict__[name] = v
        if plot_trace:
            self.plot_trace_vars.add(name)
        return v

    def create_normal(
        self,
        name: str,
        mean: float,
        sigma: float,
        plot_trace: bool = True,
        hyperprior=None,
        shape: Tuple[int, ...] = None,
    ):
        """
        Create a normal variable, adding it to self as attribute.
        :param name:
        :param mean: mean of the normal variable
        :param sigma: variance of the normal variable
        :param plot_trace: ???
        :param hyperprior: ???
        :param shape: ???
        """
        if name in self.__dict__:
            log.warning(f"Variable {name} already present, overwriting def")
        if hyperprior:
            # TODO
            pass
        kws = {}
        if shape is not None:
            kws["shape"] = shape
        v = pm.Normal(name, mean, sigma, **kws)
        self.__dict__[name] = v
        if plot_trace:
            self.plot_trace_vars.add(name)
        return v

    def create_deterministic(self, name: str, exp: tensor, plot_trace: bool = True):
        """
        Create a deterministic variable, adding it to self as attribute.
        :param name:
        :param exp: theano tensor(s?)
        :param plot_trace: ???
        """
        if name in self.__dict__:
            log.warning(f"Variable {name} already present, overwriting def")
        v = pm.Deterministic(name, exp)
        self.__dict__[name] = v
        if plot_trace:
            self.plot_trace_vars.add(name)
        return v

    @property
    def num_regions(self):
        return len(self.data.Rs)

    @property
    def num_days(self):
        return len(self.data.Ds)

    @property
    def num_countermeasures(self):
        return len(self.data.CMs)

    def run(self, draws: int, chains=2, cores=2, **kwargs):
        log.debug(self.check_test_point())
        with self.model:
            self.trace = pm.sample(
                draws=draws, chains=chains, cores=cores, init="adapt_diag", **kwargs
            )

    @staticmethod
    def produce_confidence_intervals(data: np.ndarray) -> pd.DataFrame:
        means = np.median(data, axis=0)
        li = np.percentile(data, 2.5, axis=0)
        ui = np.percentile(data, 97.5, axis=0)
        # err = np.array([means - li, ui - means])
        return pd.DataFrame.from_dict({"mean": means, "lower": li, "upper": ui})


class CMCombinedModel(BaseCMModel):
    """
    This is CMCombined_Final from the branch validation-holdout,
    revision 9cb439ed4ae514a6672d08f49df637440b77e9b7.
    This model is the model used to produce results in TODO reference.
    """

    def __init__(self, data, name="", model=None):
        super().__init__(data, name=name, model=model)

        # infection --> confirmed delay
        self.DelayProbCases = np.array(
            [
                0.0,
                0.0252817,
                0.03717965,
                0.05181224,
                0.06274125,
                0.06961334,
                0.07277174,
                0.07292397,
                0.07077184,
                0.06694868,
                0.06209945,
                0.05659917,
                0.0508999,
                0.0452042,
                0.03976573,
                0.03470891,
                0.0299895,
                0.02577721,
                0.02199923,
                0.01871723,
                0.01577148,
                0.01326564,
                0.01110783,
                0.00928827,
                0.0077231,
                0.00641162,
                0.00530572,
                0.00437895,
                0.00358801,
                0.00295791,
                0.0024217,
                0.00197484,
            ]
        )

        self.DelayProbCases = self.DelayProbCases.reshape((1, self.DelayProbCases.size))

        self.DelayProbDeaths = np.array(
            [
                0.00000000e00,
                1.64635735e-06,
                3.15032703e-05,
                1.86360977e-04,
                6.26527963e-04,
                1.54172466e-03,
                3.10103643e-03,
                5.35663499e-03,
                8.33979000e-03,
                1.19404848e-02,
                1.59939055e-02,
                2.03185081e-02,
                2.47732062e-02,
                2.90464491e-02,
                3.30612027e-02,
                3.66089026e-02,
                3.95642697e-02,
                4.18957120e-02,
                4.35715814e-02,
                4.45816884e-02,
                4.49543992e-02,
                4.47474142e-02,
                4.40036056e-02,
                4.27545988e-02,
                4.11952870e-02,
                3.92608505e-02,
                3.71824356e-02,
                3.48457206e-02,
                3.24845883e-02,
                3.00814850e-02,
                2.76519177e-02,
                2.52792720e-02,
                2.30103580e-02,
                2.07636698e-02,
                1.87005838e-02,
                1.67560244e-02,
                1.49600154e-02,
                1.32737561e-02,
                1.17831130e-02,
                1.03716286e-02,
                9.13757250e-03,
                7.98287530e-03,
                6.96265658e-03,
                6.05951833e-03,
                5.26450572e-03,
                4.56833017e-03,
                3.93189069e-03,
                3.38098392e-03,
                2.91542076e-03,
                2.49468747e-03,
                2.13152106e-03,
                1.82750115e-03,
                1.55693122e-03,
                1.31909933e-03,
                1.11729819e-03,
                9.46588730e-04,
                8.06525991e-04,
                6.81336089e-04,
                5.74623210e-04,
                4.80157895e-04,
                4.02211774e-04,
                3.35345193e-04,
                2.82450401e-04,
                2.38109993e-04,
            ]
        )
        self.DelayProbDeaths = self.DelayProbDeaths.reshape(
            (1, self.DelayProbDeaths.size)
        )

        self.CMDelayCut = 30
        self.DailyGrowthNoise = 0.2

        self.ObservedDaysIndex = np.arange(self.CMDelayCut, len(self.data.Ds))
        self.ObservedRegion_indexes = np.arange(len(self.data.Rs))
        self.num_observed_regions = self.num_regions
        self.num_observed_days = len(self.ObservedDaysIndex)
        self.observed_regions = copy.deepcopy(self.data.Rs)

        observed_active = []
        for r in range(self.num_regions):
            for d in range(self.num_days):
                # if its not masked, after the cut, and not before 100 confirmed
                if (
                    self.data.NewCases.mask[r, d] == False
                    and d > self.CMDelayCut
                    and not np.isnan(self.data.Confirmed.data[r, d])
                    and d < (self.num_days - 7)
                ):
                    observed_active.append(r * self.num_days + d)
                else:
                    self.data.NewCases.mask[r, d] = True

        self.all_observed_active = np.array(observed_active)

        observed_deaths = []
        for r in range(self.num_regions):
            for d in range(self.num_days):
                # if its not masked, after the cut, and not before 10 deaths
                if (
                    self.data.NewDeaths.mask[r, d] == False
                    and d > self.CMDelayCut
                    and not np.isnan(self.data.Deaths.data[r, d])
                ):
                    observed_deaths.append(r * self.num_days + d)
                else:
                    self.data.NewDeaths.mask[r, d] = True

        self.all_observed_deaths = np.array(observed_deaths)

        # all model variables that are built in build_model
        # TODO probably remove these once warnings are cleaned up
        self.CM_Alpha = None
        self.CMReduction = None
        self.HyperRMean = None
        self.HyperRVar = None
        self.RegionLogR = None
        self.ActiveCMs = None
        self.ActiveCMReduction = None
        self.GrowthReduction = None
        self.ExpectedLogR = None
        self.ExpectedGrowth = None
        self.GrowthCases = None
        self.GrowthDeaths = None
        self.Z1C = None
        self.Z1D = None
        self.InitialSizeCases_log = None
        self.InfectedCases_log = None
        self.InfectedCases = None
        self.ExpectedCases = None
        self.Phi = None
        self.ObservedCases = None
        self.Z2C = None
        self.InitialSizeDeaths_log = None
        self.InfectedDeaths_log = None
        self.InfectedDeaths = None
        self.ExpectedDeaths = None
        self.ObservedDeaths = None
        self.Z2D = None

    def build_model(
        self,
        r_hyperprior_mean: float = 3.25,
        cm_prior_sigma: float = 0.2,
        cm_prior: str = "normal",
        serial_interval_mean: float = SI_ALPHA / SI_BETA,
    ):
        with self.model:
            if cm_prior == "normal":
                self.CM_Alpha = pm.Normal(
                    "CM_Alpha", 0, cm_prior_sigma, shape=(self.num_countermeasures,)
                )

            if cm_prior == "half_normal":
                self.CM_Alpha = pm.HalfNormal(
                    "CM_Alpha", cm_prior_sigma, shape=(self.num_countermeasures,)
                )

            self.CMReduction = pm.Deterministic(
                "CMReduction", tensor.exp((-1.0) * self.CM_Alpha)
            )

            self.HyperRMean = pm.StudentT(
                "HyperRMean", nu=10, sigma=0.2, mu=np.log(r_hyperprior_mean),
            )

            self.HyperRVar = pm.HalfStudentT("HyperRVar", nu=10, sigma=0.2)

            self.RegionLogR = pm.Normal(
                "RegionLogR",
                self.HyperRMean,
                self.HyperRVar,
                shape=(self.num_observed_regions,),
            )

            self.ActiveCMs = pm.Data("ActiveCMs", self.data.ActiveCMs)

            self.ActiveCMReduction = (
                tensor.reshape(self.CM_Alpha, (1, self.num_countermeasures, 1))
                * self.ActiveCMs[self.ObservedRegion_indexes, :, :]
            )

            self.create_deterministic(
                "GrowthReduction",
                tensor.sum(self.ActiveCMReduction, axis=1),
                plot_trace=False,
            )

            self.ExpectedLogR = self.create_deterministic(
                "ExpectedLogR",
                tensor.reshape(self.RegionLogR, (self.num_observed_regions, 1))
                - self.GrowthReduction,
                plot_trace=False,
            )

            serial_interval_sigma = np.sqrt(SI_ALPHA / SI_BETA ** 2)
            si_beta = serial_interval_mean / serial_interval_sigma ** 2
            si_alpha = serial_interval_mean ** 2 / serial_interval_sigma ** 2

            self.ExpectedGrowth = self.create_deterministic(
                "ExpectedGrowth",
                si_beta
                * (
                    pm.math.exp(self.ExpectedLogR / si_alpha)
                    - tensor.ones_like(self.ExpectedLogR)
                ),
                plot_trace=False,
            )

            self.create_normal(
                "GrowthCases",
                self.ExpectedGrowth,
                self.DailyGrowthNoise,
                shape=(self.num_observed_regions, self.num_days),
                plot_trace=False,
            )

            self.create_normal(
                "GrowthDeaths",
                self.ExpectedGrowth,
                self.DailyGrowthNoise,
                shape=(self.num_observed_regions, self.num_days),
                plot_trace=False,
            )

            self.create_deterministic(
                "Z1C", self.GrowthCases - self.ExpectedGrowth, plot_trace=False
            )
            self.create_deterministic(
                "Z1D", self.GrowthDeaths - self.ExpectedGrowth, plot_trace=False
            )

            self.InitialSizeCases_log = pm.Normal(
                "InitialSizeCases_log", 0, 50, shape=(self.num_observed_regions,)
            )
            self.InfectedCases_log = pm.Deterministic(
                "InfectedCases_log",
                tensor.reshape(
                    self.InitialSizeCases_log, (self.num_observed_regions, 1)
                )
                + self.GrowthCases.cumsum(axis=1),
            )

            self.InfectedCases = pm.Deterministic(
                "InfectedCases", pm.math.exp(self.InfectedCases_log)
            )

            expected_cases = tensor_convolution.conv2d(
                self.InfectedCases,
                np.reshape(self.DelayProbCases, newshape=(1, self.DelayProbCases.size)),
                border_mode="full",
            )[:, : self.num_days]

            self.ExpectedCases = pm.Deterministic(
                "ExpectedCases",
                expected_cases.reshape((self.num_observed_regions, self.num_days)),
            )

            # learn the output noise for this.
            self.Phi = pm.HalfNormal("Phi_1", 5)

            # effectively handle missing values ourselves
            self.ObservedCases = pm.NegativeBinomial(
                "ObservedCases",
                mu=self.ExpectedCases.reshape(
                    (self.num_observed_regions * self.num_days,)
                )[self.all_observed_active],
                alpha=self.Phi,
                shape=(len(self.all_observed_active),),
                observed=self.data.NewCases.data.reshape(
                    (self.num_observed_regions * self.num_days,)
                )[self.all_observed_active],
            )

            self.Z2C = pm.Deterministic(
                "Z2C",
                self.ObservedCases
                - self.ExpectedCases.reshape(
                    (self.num_observed_regions * self.num_days,)
                )[self.all_observed_active],
            )

            self.InitialSizeDeaths_log = pm.Normal(
                "InitialSizeDeaths_log", 0, 50, shape=(self.num_observed_regions,)
            )
            self.InfectedDeaths_log = pm.Deterministic(
                "InfectedDeaths_log",
                tensor.reshape(
                    self.InitialSizeDeaths_log, (self.num_observed_regions, 1)
                )
                + self.GrowthDeaths.cumsum(axis=1),
            )

            self.InfectedDeaths = pm.Deterministic(
                "InfectedDeaths", pm.math.exp(self.InfectedDeaths_log)
            )

            expected_deaths = tensor_convolution.conv2d(
                self.InfectedDeaths,
                np.reshape(
                    self.DelayProbDeaths, newshape=(1, self.DelayProbDeaths.size)
                ),
                border_mode="full",
            )[:, : self.num_days]

            self.ExpectedDeaths = pm.Deterministic(
                "ExpectedDeaths",
                expected_deaths.reshape((self.num_observed_regions, self.num_days)),
            )

            # effectively handle missing values ourselves
            self.ObservedDeaths = pm.NegativeBinomial(
                "ObservedDeaths",
                mu=self.ExpectedDeaths.reshape(
                    (self.num_observed_regions * self.num_days,)
                )[self.all_observed_deaths],
                alpha=self.Phi,
                shape=(len(self.all_observed_deaths),),
                observed=self.data.NewDeaths.data.reshape(
                    (self.num_observed_regions * self.num_days,)
                )[self.all_observed_deaths],
            )

            self.create_deterministic(
                "Z2D",
                self.ObservedDeaths
                - self.ExpectedDeaths.reshape(
                    (self.num_observed_regions * self.num_days,)
                )[self.all_observed_deaths],
            )

    def region_forward_pass(self, region):
        country_idx = self.data.Rs.index(region)
        if country_idx == -1:
            raise ValueError(f"Could not find region {region}")

        infected_cases_result = self.produce_confidence_intervals(
            self.trace.InfectedCases[:, country_idx, :]
        ).add_prefix("DailyInfectedCases_")

        ec = self.trace.ExpectedCases[:, country_idx, :]
        predicted_cases_result = self.produce_confidence_intervals(
            pm.NegativeBinomial.dist(
                mu=ec,
                alpha=np.repeat(np.array([self.trace.Phi_1]), ec.shape[1], axis=0).T,
            ).random()
        ).add_prefix("PredictedNewCases_")

        ed = self.trace.ExpectedDeaths[:, country_idx, :]
        _, num_days = ed.shape
        dist = pm.NegativeBinomial.dist(
            mu=ed + 1e-3,
            alpha=np.repeat(np.array([self.trace.Phi_1]), num_days, axis=0).T,
        )

        ids = self.trace.InfectedDeaths[:, country_idx, :]
        # TODO not sure if this is necessary
        try:
            ed_output = dist.random()
        except Exception as ex:
            log.warning(
                f"Region forward pass for region {region} failed for expected death. Original exception: {ex}"
            )
            ed_output = np.ones_like(ids) * 10 ** -5
            ids = np.ones_like(ids) * 10 ** -5

        infected_deaths_result = self.produce_confidence_intervals(ids).add_prefix(
            "DailyInfectedDeaths_"
        )

        predicted_deaths_result = self.produce_confidence_intervals(
            ed_output
        ).add_prefix("PredictedDeaths_")

        predictions = pd.concat(
            [
                infected_cases_result,
                predicted_cases_result,
                infected_deaths_result,
                predicted_deaths_result,
                pd.Series(pd.to_datetime(self.data.Ds), name="date"),
            ],
            axis="columns",
        ).set_index("date")

        new_cases = self.data.NewCases[country_idx, :]
        deaths = self.data.NewDeaths[country_idx, :]
        recorded = (
            pd.DataFrame.from_dict(
                {
                    "Date": pd.to_datetime(
                        np.array(self.data.Ds)[self.ObservedDaysIndex]
                    ),
                    "RecordedNewCases": new_cases[self.ObservedDaysIndex],
                    "RecordedDeaths": deaths[self.ObservedDaysIndex],
                }
            )
            .set_index("Date")
            .sort_index()
        )

        full_result = predictions.merge(
            recorded, how="outer", left_index=True, right_index=True
        )
        return full_result
