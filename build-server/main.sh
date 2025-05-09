#!/bin/bash

set -e

REPO="${REPO}"
BRANCH="${BRANCH}"
USERNAME="${USERNAME}"
ENV_VARS="${ENV}"

GIT_REPOSITORY_URL="https://github.com/${USERNAME}/${REPO}.git"


git clone "$GIT_REPOSITORY_URL" > /dev/null 2>&1
cd "$REPO"
git checkout "$BRANCH" > /dev/null 2>&1

if [ -n "$ENV_VARS" ]; then
  echo "$ENV_VARS" | jq -r '.[] | "\(.key)=\(.value)"' > ".env"
  export $(grep -v '^#' ".env" | xargs)
fi
cd ../ && npm install > /dev/null 2>&1
node script.js > /dev/null 2>&1

