import pandas as pd
import pymc3 as pm

from epimodel.pymc3_models.cm_effect.datapreprocessor import DataPreprocessor
from epimodel.pymc3_models.cm_effect import CMCombinedModel


def run_model(data_file: str, output_file: str, extrapolation_period: int):
    dp = DataPreprocessor(mask_zero_deaths=True, mask_zero_cases=True)
    data = dp.preprocess_data(data_file, extrapolation_period=extrapolation_period)

    with CMCombinedModel(data, extrapolation_period) as model:
        model.build_model()

    with model.model:
        model.trace = pm.sample(500, tune=500, chains=2, cores=2, target_accept=0.95)

    results = []
    for region in model.data.Rs:
        region_results = model.region_forward_pass(region)
        region_results["Code"] = region
        results.append(region_results)
    result = pd.concat(results, axis="index")
    result.to_csv(output_file)
