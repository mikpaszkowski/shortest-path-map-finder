package com.example.pathapi.repository

import com.example.pathapi.dtos.NearestPointDTO
import com.example.pathapi.dtos.PathSegmentDTO
import com.example.pathapi.entities.Way
import com.example.pathapi.repository.projection.WayView
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface PathRepository : JpaRepository<Way, Long> {

    //TODO fix the query to fetch from ways_vertices_pgr not ways
    @Query(
        value = """
                WITH bbox AS (
                    -- Calculate a bounding box around the given coordinates with a small buffer
                    SELECT
                        ST_Envelope(
                            ST_Buffer(
                                ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), 0.1
                            )
                        ) AS bounding_box
                ),
                nearest_nodes AS (
                    -- Select nodes within the bounding box
                    SELECT
                        gid,
                        source,
                        target,
                        x1,
                        y1,
                        x2,
                        y2,
                        ST_Distance(
                            ST_SetSRID(ST_MakePoint(x1, y1), 4326), 
                            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
                        ) AS distance_to_x1,
                        ST_Distance(
                            ST_SetSRID(ST_MakePoint(x2, y2), 4326), 
                            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
                        ) AS distance_to_x2
                    FROM public.ways
                    WHERE ST_Within(the_geom, (SELECT bounding_box FROM bbox))
                )
                SELECT 
                    CASE 
                        WHEN distance_to_x1 < distance_to_x2 THEN source
                        ELSE target
                    END AS id,
                    CASE 
                        WHEN distance_to_x1 < distance_to_x2 THEN x1
                        ELSE x2
                    END AS longitude,
                    CASE 
                        WHEN distance_to_x1 < distance_to_x2 THEN y1
                        ELSE y2
                    END AS latitude
                FROM nearest_nodes
                ORDER BY LEAST(distance_to_x1, distance_to_x2)
                LIMIT 1;
    """,
        nativeQuery = true
    )
    fun findNearestPoint(
        @Param("longitude") longitude: Double,
        @Param("latitude") latitude: Double
    ): NearestPointDTO

    @Query(
        value = """
          WITH dijkstra_result AS (
                SELECT * 
                FROM pgr_dijkstra(
                    'SELECT gid::bigint AS id,
                                source::bigint,
                                target::bigint,
                                length * penalty AS cost,
                                length * penalty as reverse_cost
                    FROM public.ways
                    JOIN public.configuration
                    USING (tag_id)
                    ',
                    :sourceId, -- Starting node ID
                    :targetId,  -- Ending node ID
                    directed := true
                )
            )
            SELECT 
                dr.seq,                    -- Sequence number of the step in the path
                dr.node,                   -- Node ID (start or end of an edge)
                dr.edge,                   -- Edge ID (segment traversed)
                the_geom AS geometry, -- Geometry of the edge as GeoJSON for UI rendering
                ST_X(ST_StartPoint(w.the_geom)) AS start_longitude, -- Start longitude of the edge
                ST_Y(ST_StartPoint(w.the_geom)) AS start_latitude,  -- Start latitude of the edge
                ST_X(ST_EndPoint(w.the_geom)) AS end_longitude,     -- End longitude of the edge
                ST_Y(ST_EndPoint(w.the_geom)) AS end_latitude      -- End latitude of the edge
            FROM 
                dijkstra_result dr
            JOIN 
                public.ways w ON dr.edge = w.gid
            WHERE 
                dr.edge >= 0;
        """,
        nativeQuery = true
    )
    fun findShortestPathWithDistanceCost(
        @Param("sourceId") sourceId: Long,
        @Param("targetId") targetId: Long
    ): List<PathSegmentDTO>

    @Query(
        value = """
          WITH dijkstra_result AS (
                SELECT * 
                FROM pgr_dijkstra(
                    'SELECT gid::bigint AS id,
                                source::bigint,
                                target::bigint,
                                cost * penalty AS cost,
                                reverse_cost * penalty as reverse_cost
                    FROM public.ways
                    JOIN public.configuration
                    USING (tag_id)
                    ',
                    :sourceId, -- Starting node ID
                    :targetId,  -- Ending node ID
                    directed := true
                )
            )
            SELECT 
                dr.seq,                    -- Sequence number of the step in the path
                dr.node,                   -- Node ID (start or end of an edge)
                dr.edge,                   -- Edge ID (segment traversed)
                the_geom AS geometry, -- Geometry of the edge as GeoJSON for UI rendering
                ST_X(ST_StartPoint(w.the_geom)) AS start_longitude, -- Start longitude of the edge
                ST_Y(ST_StartPoint(w.the_geom)) AS start_latitude,  -- Start latitude of the edge
                ST_X(ST_EndPoint(w.the_geom)) AS end_longitude,     -- End longitude of the edge
                ST_Y(ST_EndPoint(w.the_geom)) AS end_latitude      -- End latitude of the edge
            FROM 
                dijkstra_result dr
            JOIN 
                public.ways w ON dr.edge = w.gid
            WHERE 
                dr.edge >= 0;
        """,
        nativeQuery = true
    )
    fun findShortestPathWithTimeCost(
        @Param("sourceId") sourceId: Long,
        @Param("targetId") targetId: Long
    ): List<PathSegmentDTO>


    @Query(
        value = """
    WITH waypoint_path AS (
        SELECT * 
        FROM pgr_dijkstraVia(
               'SELECT gid::bigint AS id,
                                source::bigint,
                                target::bigint,
                                cost * penalty AS cost,
                                reverse_cost * penalty as reverse_cost
                    FROM public.ways
                    JOIN public.configuration
                    USING (tag_id)',
            (SELECT string_to_array(:waypoints, ',')::bigint[]), -- Array of waypoint node IDs
            directed := true
        )
    )
    SELECT 
        wp.seq,                   -- Sequence number of the step in the path
        wp.node,                  -- Node ID (start or end of an edge)
        wp.edge,                  -- Edge ID (segment traversed)
        w.the_geom AS geometry,   -- Geometry of the edge as GeoJSON for UI rendering
        ST_X(ST_StartPoint(w.the_geom)) AS start_longitude, -- Start longitude of the edge
        ST_Y(ST_StartPoint(w.the_geom)) AS start_latitude,  -- Start latitude of the edge
        ST_X(ST_EndPoint(w.the_geom)) AS end_longitude,     -- End longitude of the edge
        ST_Y(ST_EndPoint(w.the_geom)) AS end_latitude      -- End latitude of the edge
    FROM 
        waypoint_path wp
    JOIN 
        public.ways w ON wp.edge = w.gid
    WHERE 
        wp.edge >= 0;
    """,
        nativeQuery = true
    )
    fun findPathWithWaypoints(
        @Param("waypoints") waypoints: String
    ): List<PathSegmentDTO>


    @Query(
        value = """
            SELECT
                w.gid AS id,
                w.cost AS cost,
                w.length AS length,
                w.reverse_cost AS reverseCost,
                vs.id AS sourceId,
                vs.lon AS sourceLon,
                vs.lat AS sourceLat,
                vt.id AS targetId,
                vt.lon AS targetLon,
                vt.lat AS targetLat
            FROM
                public.ways w
            JOIN
                public.ways_vertices_pgr vs ON vs.id = w.source
            JOIN
                public.ways_vertices_pgr vt ON vt.id = w.target
            WHERE
                ST_DWithin(
                    ST_Transform(w.the_geom, 3857), -- Transform to a metric coordinate system (e.g., EPSG:3857)
                    ST_Transform((SELECT the_geom FROM public.ways_vertices_pgr WHERE id = :sourceId LIMIT 1), 3857),
                    :range
                )
                AND w.tag_id NOT IN (
                    SELECT tag_id
                    FROM public.configuration config
                    WHERE config.tag_value IN (
                        'steps', 'footway', 'pedestrian'
                        )
    );    
    """,
        nativeQuery = true
    )
    fun findAllInRange(@Param("sourceId") sourceId: Long, @Param("range") range: Double): List<WayView>

    @Query(
        value = """
        SELECT 
            ROW_NUMBER() OVER (ORDER BY w.gid) AS seq,                   -- Sequence number of the step in the path
            w.target as node,                  -- Node ID (start or end of an edge)
            w.gid as edge,                  -- Edge ID (segment traversed)
            w.the_geom AS geometry,   -- Geometry of the edge as GeoJSON for UI rendering
            ST_X(ST_StartPoint(w.the_geom)) AS start_longitude, -- Start longitude of the edge
            ST_Y(ST_StartPoint(w.the_geom)) AS start_latitude,  -- Start latitude of the edge
            ST_X(ST_EndPoint(w.the_geom)) AS end_longitude,     -- End longitude of the edge
            ST_Y(ST_EndPoint(w.the_geom)) AS end_latitude      -- End latitude of the edge
        FROM 
            public.ways w
        WHERE 
            w.gid IN (:wayIds);
    """,
        nativeQuery = true
    )
    fun findAllByGivenPathOfIds(@Param("wayIds") waysIds: List<Long>): List<PathSegmentDTO>
}