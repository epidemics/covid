#!/bin/bash

EXPORT_NAME="$@"

echo -E ${GCP_KEY:1:-1} > key.json
echo "gcloud login"
gcloud auth activate-service-account --key-file key.json
gcloud config set project ${PROJECT_NAME}

echo "r_estimates download"
latest_r_estimates_url=https://storage.googleapis.com/static-covid/static/v4/main/r_estimates.csv
mkdir data-dir/outputs
curl $latest_r_estimates_url > data-dir/outputs/r_estimates.csv

export MKL_NUM_THREADS=1
export OMP_NUM_THREADS=1

python luigid --background --address 0.0.0.0

python run_luigi --scheduler-host localhost ExportNPIModelResults --export-name $EXPORT_NAME

python run_luigi --scheduler-host localhost WebUpload --exported-data data-dir/outputs/web-exports/$EXPORT_NAME --overwrite --channel $EXPORT_NAME

# delete the the instance after the results are uploaded
gcloud compute instances delete $INSTANCE_NAME --zone \
        $(curl -H Metadata-Flavor:Google http://metadata.google.internal/computeMetadata/v1/instance/zone -s | cut -d/ -f4) -q