FROM iboates/osm2pgrouting:latest

# Set the working directory
WORKDIR /osm

# Copy the script into the container
COPY ./setup/import.sh import.sh
# COPY ./setup/download_osm.sh download_osm.sh
COPY osm/greater-london.osm greater-london.osm

# RUN chmod +x download_osm.sh import.sh

# Make the script executable
# RUN /bin/sh download_osm.sh

ENTRYPOINT ["/bin/sh", "import.sh"]