import csv
import logging
import pathlib
import re
import xml.etree.ElementTree as ET

import h5py
import pandas as pd

log = logging.getLogger('process_data_hdf')


class Simulation:
    def __init__(self, def_tree, hdf_file, dir_path=None):
        self.ns = {'gv': 'http://www.gleamviz.org/xmlns/gleamviz_v4_0'}
        assert isinstance(def_tree, ET.ElementTree)
        self.tree = def_tree
        self.root = self.tree.getroot()
        self.name = self.f1('gv:definition').attrib['name']
        assert isinstance(hdf_file, (h5py.File, None))
        self.hdf = hdf_file
        self.dir = dir_path

    @classmethod
    def load_dir(cls, path, only_finished=True):
        path = pathlib.Path(path)
        h5path = path / 'results.h5'
        if only_finished and not h5path.exists():
            log.info("Skipping uncomputed {}".format(path))
            return None
        log.info("Loading Gleam simulation from {}".format(path))
        if not h5path.exists():
            hf = None
        else:
            hf = h5py.File(h5path, 'r')
        et = ET.parse(path / 'definition.xml')
        return cls(et, hf, path)

    def __repr__(self):
        return "<Simulation {!r}".format(self.name)

    def fa(self, query):
        return self.root.findall(query, namespaces=self.ns)

    def f1(self, query):
        x = self.root.findall(query, namespaces=self.ns)
        assert len(x) == 1
        return x[0]

    @property
    def param_seasonality(self):
        return float(self.f1('gv:definition/gv:parameters').get('seasonalityAlphaMin'))
        
    @property
    def param_airtraffic(self):
        return float(self.f1('gv:definition/gv:parameters').get('occupancyRate')) / 100.0

    @property
    def param_mitigation(self):
        v = self.fa('gv:definition/gv:exceptions/gv:exception[@continents="1 2 4 3 5"]/gv:variable[@name="beta"]')
        if len(v) == 0:
            return 0.0
        return float(v[0].get('value'))

    def get_seq(self, num, kind, cumulative=True, sub="median"):
        if kind == "city":
            kind = "basin"
        p = "population/{}/{}/{}/dset".format(["new", "cumulative"][cumulative], kind, sub)
        return self.hdf[p][:, 0, num, :]



class SimSet:
    def __init__(self):
        self.sims = []
        self.by_param = {}

    def load_sim(self, path):
        s = Simulation.load_dir(path, only_finished=True)
        if not s:
            return None
        k = (s.param_seasonality, s.param_airtraffic, s.param_mitigation)
        assert k not in self.by_param
        self.by_param[k] = s
        self.sims.append(s)
        return s

    def load_dir(self, path):
        path = pathlib.Path(path)
        assert path.is_dir()
        for p in path.iterdir():
            if p.suffix == '.gvh5':
                self.load_sim(p)


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
    for t in range(time):
        row = [name, "{:.1f}".format(mitigation), t]
        for sq in seqs:
            # NOTE: This is CumulativeRecovered - CumulativeInfected
            d = sq[2, t] - sq[3, t]  
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

    simset = SimSet()
    simset.load_dir(DIR)
    write_csv_v2(simset, "country_selection.tsv", "out.csv")


if __name__ == "__main__":
    main()
