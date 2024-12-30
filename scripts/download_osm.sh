#!/bin/bash

# Exit on errors
set -e

# Variables
OSM_URL="https://download.geofabrik.de/europe/poland/mazowieckie-latest.osm.pbf"
OSM_FILE="/data/maosovian-latest.osm.pbf"

# Create directory if it doesn't exist
mkdir -p /data

# Check if the OSM file already exists
if [ -f "$OSM_FILE" ]; then
    echo "OSM data already exists at $OSM_FILE. Skipping download."
else
    echo "Downloading OSM data from $OSM_URL..."
    wget -q $OSM_URL -O $OSM_FILE
    echo "Download completed: $OSM_FILE"
fi