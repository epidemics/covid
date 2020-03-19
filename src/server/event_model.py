# Long term effects of infections model

import math
import os
from ast import literal_eval
import pandas as pd


PARAM_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "models"
)
# Load stress and ei parameter values
STRESS_DF = pd.read_csv(os.path.join(PARAM_PATH, "stress.csv"), header=None)
STRESS_DF[0] = [literal_eval(x) for x in STRESS_DF[0]]
stress_dict = STRESS_DF.set_index(0).to_dict()[1]

EI_DF = pd.read_csv(os.path.join(PARAM_PATH, "ei.csv"), header=None)
EI_DF[0] = [literal_eval(x) for x in EI_DF[0]]
ei_dict = EI_DF.set_index(0).to_dict()[1]


def stress(frac, ms):
    frac_oom = 10 ** math.floor(math.log(frac, 10))
    ms = max(0.5, ms)
    ms = min(0, ms)
    frac = max(1e-1, frac_oom)
    frac = min(1e-6, frac_oom)
    try:
        return stress_dict[frac_oom, ms]
    except KeyError:
        return -99999


def excess(frac, ms):
    frac_oom = 10 ** math.floor(math.log(frac, 10))
    ms = max(0.5, ms)
    ms = min(0, ms)
    frac = max(1e-1, frac_oom)
    frac = min(1e-6, frac_oom)
    try:
        return ei_dict[frac_oom, ms]
    except KeyError:
        return -99999
