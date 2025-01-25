-- Create indexes on the source and target columns
CREATE INDEX source_idx ON ways("source");
CREATE INDEX target_idx ON ways("target");
CREATE INDEX idx_ways_geom ON public.ways USING GIST (the_geom);

ALTER TABLE configuration ADD COLUMN penalty FLOAT;
-- No penalty
UPDATE configuration SET penalty=1;

-- Not including pedestrian ways
UPDATE configuration SET penalty=-1.0 WHERE tag_value IN ('steps','footway','pedestrian');

-- Penalizing with 5 times the costs
UPDATE configuration SET penalty=5 WHERE tag_value IN ('residential');

-- Encuraging the use of "fast" roads
UPDATE configuration SET penalty=0.5 WHERE tag_value IN ('tertiary');
UPDATE configuration SET penalty=0.3 WHERE tag_value IN (
    'primary','primary_link',
    'trunk','trunk_link',
    'motorway','motorway_junction','motorway_link',
    'secondary');

CREATE INDEX idx_ways_tag_id ON public.ways(tag_id);
CREATE INDEX idx_configuration_tag_id ON public.configuration(tag_id);