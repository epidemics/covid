#!/bin/bash

EXPORT_NAME="$@"

cat key.json
gcloud auth activate-service-account --key-file key.json

python run_luigi ExportNPIModelResults --export-name $EXPORT_NAME

echo -E "$GCP_KEY" > key.json

python run_luigi WebUpload --exported-data data-dir/outputs/web-exports/$EXPORT_NAME --overwrite --channel $EXPORT_NAME