#!bin/sh

# Exit on error
set -e

# Variables
OSM_FILE="city.osm"
DB_HOST="postgis_db"
DB_PORT="5432"
DB_NAME="o2p"
DB_USER="o2p"
DB_PASSWORD="o2p"

# Import OSM data into the database
if [ -f "$OSM_FILE" ]; then
    sleep 30
    echo "Importing OSM data from $OSM_FILE into PostGIS database..."
    osm2pgrouting --dbname $DB_NAME --username $DB_USER --host $DB_HOST --port $DB_PORT --password $DB_PASSWORD --clean --f $OSM_FILE
    echo "Import completed successfully."
else
    echo "OSM file not found: $OSM_FILE"
    exit 1
fi
