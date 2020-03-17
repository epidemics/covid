import argparse
import csv
import logging
import pathlib

import numpy as np
import pandas as pd

from simulation import SimSet, Simulation

log = logging.getLogger('process_data_hdf')

PS_MITIGATION = [0.0, 0.3, 0.4, 0.5]
PS_S = [0.85, 0.7, 0.1]
PS_AT = [0.2, 0.7]

HDR0 = "Country,Mitigation,Timestep,Cumulative Median_s=0.85_at=0.2,Cumulative Median_s=0.7_at=0.7,Cumulative Median_s=0.1_at=0.2,Cumulative Median_s=0.85_at=0.7,Cumulative Median_s=0.1_at=0.7,Cumulative Median_s=0.7_at=0.2"

DIR = pathlib.Path('../../../GLEAMviz/data/sims')

def read_selection_tsv(path):
    return pd.read_csv(path, sep='\t')[['Country', 'GleamCode', 'Kind']]

def write_area_csv_v2(w, name, num, kind, sims, mitigation):
    assert len(sims) > 0
    time = sims[0].get_seq(num, kind).shape[1]
    seqs = [s.get_seq(num, kind) for s in sims]
    #### HACK: Guess the original infected ratio from minimal value (everyone healthy)
    minimum = min([np.min(sq[2, :] - sq[3, :]) for sq in seqs])

    for t in range(time):
        row = [name, "{:.1f}".format(mitigation), t]
        for sq in seqs:
            # NOTE: This is CumulativeRecovered - CumulativeInfected
            d = sq[2, t] - sq[3, t] - minimum
            # NOTE: All the numbers are per person (not per 1000 as in export)
            row.append("{:.4f}".format(1000.0 * d))
        w.writerow(row)

def write_csv_v2(simset, sel_tsv_path, dest_path):
    with open(dest_path, 'wt') as f:
        w = csv.writer(f)
        hdr = ["Country", "Mitigation", "Timestep"]
        for at in PS_AT:
            for s in PS_S:
                hdr.append("Cumulative Median_s={:g}_at={:g}".format(s, at))
        print(','.join(hdr))
        print(HDR0)
        #assert ','.join(hdr) == HDR0
        w.writerow(hdr)

        sel = read_selection_tsv(sel_tsv_path)
        for name, gc, kind in sel.itertuples(index=False):
            log.info("Writing data for country {!r} [{}, {}]".format(name, kind, gc))
            for mit in PS_MITIGATION:
                sims = []
                for at in PS_AT:
                    for s in PS_S:
                        sims.append(simset.by_param[(s, at, mit)])
                write_area_csv_v2(w, name, gc, kind, sims, mit)


def main():
    logging.basicConfig(level=logging.INFO)
    ap = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    ap.add_argument(
        "SIM_DIRS",
        nargs="+",
        default=None,
        help="List of Gleam dirs with HDF5 files to read.",
    )
    ap.add_argument(
        "-d", "--debug", action="store_true", help="Display debugging mesages.",
    )
    ap.add_argument(
        "-S", "--selection_tsv", default="country_selection.tsv", help="Country/city selecton TSV (must contain IDs).",
    )
    ap.add_argument(
        "-O", "--output_csv", default="line-data-v2.csv", help="Write CSV (line-data-v2) output to this file.",
    )

    ap.add_argument(
        "-P",
        "--params",
        type=str, default=[],
        action="append",
        metavar=("seasonality,airtraffic,mitigation",),
        help="Override the three params, can be repeated for multiple outputs.",
    )
    ap.add_argument(
        "--name", type=str, default=None, help="Base name of def.xml.",
    )

    args = ap.parse_args()
    if args.debug:
        logging.root.setLevel(logging.DEBUG)

    simset = SimSet()
    for d in args.SIM_DIRS:
        simset.load_sim(d)
    write_csv_v2(simset, args.selection_tsv, args.output_csv)


if __name__ == "__main__":
    main()
