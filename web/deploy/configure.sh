#!/usr/bin/env bash

#set -x

BRANCH_NAME=$(echo "${GITHUB_REF}" | cut -d / -f3)

if [[ -z "${BRANCH_NAME}" ]]; then
  >&2 echo "Invalid branch ref ${GITHUB_REF}"; exit 1
fi

CONFIG_JSON=$(jq -r ".\"${BRANCH_NAME}\"" web/deploy/site_configs.json)

if [[ "${CONFIG_JSON}" == "null" ]]; then
  >&2 echo "The branch ${BRANCH_NAME} is not configured to be deployed"; exit 1
fi

for s in $(echo "${CONFIG_JSON}" | jq -r "to_entries|map(\"\(.key)=\(.value|tostring)\")|.[]" ); do
  export $s
done

cat << EOM > configuration.env
STATIC_URL=${static}
RELEASE_NAMESPACE=${namespace}
VALUES_FILE=${values}
EOM

echo "Exported configuration for ${BRANCH_NAME}:"
cat configuration.env
