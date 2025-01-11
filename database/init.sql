-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pgRouting extension
CREATE EXTENSION IF NOT EXISTS pgrouting;

-- Assuming you have a table named 'ways' with a geometry column 'the_geom'
-- Add source and target columns
ALTER TABLE ways ADD COLUMN source INTEGER;
ALTER TABLE ways ADD COLUMN target INTEGER;

-- Use the assign_vertex_id function to populate the source and target columns
SELECT pgr_createTopology('ways', 0.00001, 'the_geom', 'id');

-- Create indexes on the source and target columns
CREATE INDEX source_idx ON ways("source");
CREATE INDEX target_idx ON ways("target");
CREATE INDEX idx_ways_geom ON public.ways USING GIST (the_geom);