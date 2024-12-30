#!bin/sh

# Exit on error
set -e

# Variables
OSM_FILE="/data/maosovian-latest.osm.pbf"
DB_HOST="postgis_db"
DB_PORT="5432"
DB_NAME="o2p"
DB_USER="o2p"

# # Wait for the db to be ready
# echo "Waiting for the database to be ready ..."
# until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
#     sleep 2
# done

# cp $OSM_FILE /osm/data

# Import OSM data into the database
if [ -f "$OSM_FILE" ]; then
    sleep 30
    echo "Importing OSM data from $OSM_FILE into PostGIS database..."
    osm2pgsql --create -d $DB_NAME -U $DB_USER -H $DB_HOST -P $DB_PORT $OSM_FILE
    echo "Import completed successfully."
else
    echo "OSM file not found: $OSM_FILE"
    exit 1
fi
