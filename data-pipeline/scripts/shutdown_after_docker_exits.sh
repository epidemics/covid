#!/bin/bash

function check_docker_and_shutdown {
  # sleep first so that the docker container can start up
  touch /tmp/script_running
  sleep 300
  touch /tmp/script_woke_up

  while true; do
    if docker ps | grep -q npi-model; then
      echo "NPI model is still running "
      sleep 1
    else
      touch /tmp/attempting_deletion
      echo "No container running, deleting instance"
      gcloud compute instances stop $(hostname) --zone \
        $(curl -H Metadata-Flavor:Google http://metadata.google.internal/computeMetadata/v1/instance/zone -s | cut -d/ -f4) -q
    fi
  done
}

nohup check_docker_and_shutdown &

EOF