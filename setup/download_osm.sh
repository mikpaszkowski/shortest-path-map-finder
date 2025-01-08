#!/bin/bash

# Exit on errors
set -e

# Variables
OSM_URL="https://download.geofabrik.de/europe/united-kingdom/england/merseyside-latest.osm.pbf"
OSM_FILE="./osm/greater-london.osm.pbf"

sudo mkdir -p ./osm

# Check if the OSM file already exists
if [ -f "$OSM_FILE" ]; then
    echo "OSM data already exists at $OSM_FILE. Skipping download."
else
    echo "Downloading OSM data from $OSM_URL..."
    sudo wget -q $OSM_URL -O $OSM_FILE
    echo "Download completed: $OSM_FILE"

    echo "Converting PBF format to OSM format..."
    sudo osmosis --read-pbf $OSM_FILE --write-xml ./osm/greater-london.osm
    echo "Conversion completed: /osm/greater-london.osm"
fi