#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rm package.zip && cd ${DIR}/package && zip -r ../package.zip *
