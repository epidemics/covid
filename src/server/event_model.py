# Long term effects of infections model

import numpy as np

# The first argument is the order of magnitude of the infection prevalence, 
# the second is the strength of control measures: Reff=R0*(1-controlStrength)

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
    (1e-6,0.5): 0,
    (1e-5,0.5): 0,
    (1e-4,0.5): 0,
    (1e-3,0.5): 0,
    (1e-2,0.5): 0,
    (1e-1,0.5): 0
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

def handle_inputs(frac,ms):
    frac_oom = 10 ** np.floor(np.log10(frac))
    ms_clipped = min(0.5, ms)
    if ms_clipped==0.1:
        ms_clipped = 0.3
    elif (0< ms_clipped) and (0.3>ms_clipped):
        ms_clipped = 0
    else:
        ms_clipped = max(0, ms_clipped)
    frac_oom = min(1e-1, frac_oom)
    frac_oom = max(1e-6, frac_oom)
    ms_clipped = np.round(ms_clipped,1)
    return frac_oom, ms_clipped


def stress(frac, ms):
    frac_oom, ms_clipped = handle_inputs(frac,ms)
    return stress_dict[frac_oom, ms_clipped]



def excess(frac, ms):
    frac_oom, ms_clipped = handle_inputs(frac,ms)
    return ei_dict[frac_oom, ms_clipped]

