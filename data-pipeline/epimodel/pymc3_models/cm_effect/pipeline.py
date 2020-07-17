import pandas as pd
import pymc3 as pm
import pickle

from epimodel.pymc3_models.cm_effect.datapreprocessor import DataPreprocessor
from epimodel.pymc3_models.cm_effect import CMCombinedModel


def run_model(data_file: str, output_file: str, extrapolation_period: int):
    dp = DataPreprocessor()
    data = dp.preprocess_data(data_file)

    with CMCombinedModel(data) as model:
        model.build_model()

    with model.model:
        model.trace = pm.sample(1000, chains=2, cores=6, target_accept=0.95, init="adapt_diag")

    with open('model.pckl', 'wb') as f:
        pickle.dump(model, f)

    # with open('model.pckl', 'rb') as f:
    #     model = pickle.load(f)

    results = []
    for region in model.data.Rs:
        region_results = model.region_forward_pass(region, extrapolation_period=extrapolation_period)
        region_results["Code"] = region
        results.append(region_results)
    result = pd.concat(results, axis="index")
    result.to_csv(output_file)
