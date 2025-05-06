#!/bin/bash

set -e

REPO="${REPO}"
BRANCH="${BRANCH}"
USERNAME="${USERNAME}"
ENV_VARS="${ENV}"

GIT_REPOSITORY_URL="https://github.com/${USERNAME}/${REPO}.git"


git clone "$GIT_REPOSITORY_URL" 
cd "$REPO"
git checkout "$BRANCH"

if [ -n "$ENV_VARS" ]; then
  echo "$ENV_VARS" | jq -r '.[] | "\(.key)=\(.value)"' > ".env"
  export $(grep -v '^#' ".env" | xargs)
fi
cd ../ && npm install 
node script.js

