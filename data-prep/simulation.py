import logging
import pathlib
import xml.etree.ElementTree as ET

import h5py

log = logging.getLogger('simulation')


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

