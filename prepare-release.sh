#!/bin/bash

set -e

echo ">> Cleaning up..."
npm run clean

echo ">> Building a package..."
npm run build
mkdir -p dist/
cp -r lib/src/* dist/

echo ">> Cleaning up a package.json file..."
node scripts/clean-package-json.js

echo "Package is ready to publish"
