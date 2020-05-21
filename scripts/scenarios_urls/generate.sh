#!/usr/bin/env bash

set -xe
git clone https://github.com/neherlab/covid19_scenarios.git
# last confirmed working revision
# git reset --hard 4accce6575a5f7ff269f53644d8b0956e17be4d2

cd covid19_scenarios || exit
git am < ../0001-scenario-generation-script.patch
yarn generate
cp scenarios.json ../../../frontend/data/
cd ..

rm -rf covid19_scenarios/
