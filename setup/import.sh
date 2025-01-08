#!bin/sh

# Exit on error
set -e

# Variables
OSM_FILE="greater-london.osm"
DB_HOST="postgis_db"
DB_PORT="5432"
DB_NAME="o2p"
DB_USER="o2p"
DB_PASSWORD="o2p"

# # Wait for the db to be ready
# echo "Waiting for the database to be ready ..."
# until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
#     sleep 2
# done

# cp $OSM_FILE /osm/data

pwd
# ls -l /data
ls -l .

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
