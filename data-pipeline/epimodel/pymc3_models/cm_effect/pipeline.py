import pandas as pd
import pymc3 as pm

from epimodel.pymc3_models.cm_effect.datapreprocessor import DataPreprocessor
from epimodel.pymc3_models.cm_effect import CMCombinedModel


def run_model(data_file: str, output_file: str):
    dp = DataPreprocessor(drop_HS=True)
    data = dp.preprocess_data(data_file)

    with CMCombinedModel(data) as model:
        model.build_model()

    with model.model:
        model.trace = pm.sample(2000, chains=2, cores=8, target_accept=0.95)

    results = []
    for region in model.data.Rs:
        region_results = model.region_forward_pass(region)
        region_results["Code"] = region
        results.append(region_results)
    result = pd.concat(results, axis="index")
    result.to_csv(output_file)
