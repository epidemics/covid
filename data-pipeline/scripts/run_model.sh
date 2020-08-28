#!/bin/bash

EXPORT_NAME="$@"

echo -E "$GCP_KEY" > key.json
echo "gcloud login"
gcloud auth activate-service-account --key-file key.json

echo "r_estimates download"
latest_r_estimates_url=https://storage.googleapis.com/static-covid/static/v4/main/r_estimates.csv
mkdir data-dir/outputs
curl $latest_r_estimates_url > data-dir/outputs/r_estimates.csv

python run_luigi WebExport --export-name $EXPORT_NAME --automatic --UpdateForetold-foretold-channel ${FORETOLD_CHANNEL}

python run_luigi ExportNPIModelResults --export-name $EXPORT_NAME

python run_luigi WebUpload --exported-data data-dir/outputs/web-exports/$EXPORT_NAME --overwrite --channel $EXPORT_NAME

# delete the the instance after the results are uploaded
gcloud compute instances delete $INSTANCE_NAME --zone \
        $(curl -H Metadata-Flavor:Google http://metadata.google.internal/computeMetadata/v1/instance/zone -s | cut -d/ -f4) -q