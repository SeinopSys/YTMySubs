#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ -f package.zip ]; then
  rm package.zip
  echo "Deleted existing archive"
fi
cd ${DIR}/package && zip -r ../package.zip *
