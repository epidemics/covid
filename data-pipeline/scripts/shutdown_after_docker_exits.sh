#!/bin/bash

# sleep first so that the docker container can start up
sleep 600

while true; do
  if docker ps | grep -q npimodel; then
    sleep 60
  else
    gcloud compute instances stop $(hostname) --zone \
      $(curl -H Metadata-Flavor:Google http://metadata.google.internal/computeMetadata/v1/instance/zone -s | cut -d/ -f4) -q
  fi
done
