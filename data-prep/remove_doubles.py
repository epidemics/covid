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
    "md_cities.tsv",
    "md_continents.tsv",
    "md_countries.tsv",
    "md_hemispheres.tsv",
    "md_regions.tsv",
]


def fix_single_file(md):
    s = ""
    with open(md) as ifile:
        header = next(ifile).strip().split("\t")
        s += "\t".join(header[1:]) + "\n"
        for line in ifile:
            if len(line.split("\t")) > len(header):
                m = re.findall(r"[0-9]+", line)
                counter = int(m[0])
                ls = [m[0]]
                for i in m:
                    if int(i) == counter + 1:
                        ls.append(str(i))
                        counter += 1
                indexes = [line.index(ix) for ix in ls]
                new_line = ""
                for en, ix in enumerate(indexes):
                    end = en + 1 if en < len(indexes) - 1 else None
                    new_line += (
                        line[indexes[en] : indexes[end] if end else None].rstrip()
                        + "\n"
                    )
                s += new_line
            else:
                s += line.lstrip()
    return s


for md in mds:
    s = fix_single_file(md)
    with open(md, "w") as ofile:
        ofile.write(s)
