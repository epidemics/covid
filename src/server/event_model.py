# Long term effects of infections model

import math

# TODO: would be better to load these from a csv

stress_dict = {
    (1e-6, 0.4): 2.4,
    (1e-6, 0.3): 1.5,
    (1e-6, 0): 0.8,
    (1e-5, 0.4): 2.4,
    (1e-5, 0.3): 1.5,
    (1e-5, 0): 0.9,
    (1e-4, 0.4): 2.3,
    (1e-4, 0.3): 1.5,
    (1e-4, 0): 0.8,
    (1e-3, 0.4): 3.9,
    (1e-3, 0.3): 2.2,
    (1e-3, 0): 0.9,
    (1e-2, 0.4): 3.8,
    (1e-2, 0.3): 2.2,
    (1e-2, 0): 0.8,
    (1e-1, 0.4): 1,
    (1e-1, 0.3): 0.7,
    (1e-1, 0): 0.2,
}


ei_dict = {
    (1e-6, 0): 0.2,
    (1e-6, 0.3): 0.4,
    (1e-6, 0.4): 0.7,
    (1e-6, 0.5): 34.5,
    (1e-5, 0): 0.2,
    (1e-5, 0.3): 0.4,
    (1e-5, 0.4): 0.7,
    (1e-5, 0.5): 9.5,
    (1e-4, 0): 0.2,
    (1e-4, 0.3): 0.4,
    (1e-4, 0.4): 0.7,
    (1e-4, 0.5): 2.6,
    (1e-3, 0): 0.2,
    (1e-3, 0.3): 0.6,
    (1e-3, 0.4): 1.1,
    (1e-3, 0.5): 3.2,
    (1e-2, 0): 0.2,
    (1e-2, 0.3): 0.6,
    (1e-2, 0.4): 1.1,
    (1e-2, 0.5): 2.5,
    (1e-1, 0): 0.2,
    (1e-1, 0.3): 0.5,
    (1e-1, 0.4): 0.9,
    (1e-1, 0.5): 1.3,
}


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
