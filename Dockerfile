FROM iboates/osm2pgsql:latest

# Set the working directory
WORKDIR /osm

# Copy the script into the container
COPY ./scripts/import.sh import.sh
COPY ./scripts/download_osm.sh download_osm.sh

RUN chmod +x download_osm.sh import.sh

# Make the script executable
RUN /bin/sh download_osm.sh

ENTRYPOINT ["/bin/sh", "import.sh"]