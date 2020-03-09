import argparse
import os
import shutil
import re

parser = argparse.ArgumentParser()
parser.add_argument("directory", help="Directory with the gleamviz exported data")
parser.add_argument("outdir", help="Output directory")
args = parser.parse_args()

shutil.copytree(args.directory, args.outdir)
os.chdir(args.outdir)

mds = [
    "md_continents.tsv",
    "md_countries.tsv",
    "md_hemispheres.tsv",
    "md_regions.tsv",
]

for md in mds:
    s = ""
    with open(md) as ifile:
        next(ifile)
        s += '#\t"Name"\n'
        for line in ifile:
            m = re.findall(r"[0-9]+", line)
            if len(m) == 2:
                ix = line.index(m[1])
                first = line[:ix].rstrip("\t")
                second = line[ix:]
                s += first + "\n\t" + second
            else:
                s += line
    with open(md, "w") as ofile:
        ofile.write(s)
