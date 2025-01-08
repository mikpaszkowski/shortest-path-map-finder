package com.example.pathapi.repository

import com.example.pathapi.dtos.NearestPointDTO
import com.example.pathapi.entities.Way
import jakarta.persistence.Entity
import jakarta.persistence.Id
import org.locationtech.jts.geom.Point
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface PathRepository : JpaRepository<Way, Long> {

    @Query(
        value = """
           SELECT 
            CASE 
                WHEN ST_Distance(
                    ST_SetSRID(ST_MakePoint(x1, y1), 4326), 
                    ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
                ) 
                <
                ST_Distance(
                    ST_SetSRID(ST_MakePoint(x2, y2), 4326), 
                    ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
                )
                THEN ST_MakePoint(x1, y1)
                ELSE ST_MakePoint(x2, y2)
            END AS nearest_node
            FROM public.ways
            ORDER BY 
                LEAST(
                    ST_Distance(
                        ST_SetSRID(ST_MakePoint(x1, y1), 4326), 
                        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
                    ),
                    ST_Distance(
                        ST_SetSRID(ST_MakePoint(x2, y2), 4326), 
                        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
                    )
                )
            LIMIT 1;
        """,
        nativeQuery = true
    )
    fun findNearestPoint(
        @Param("longitude") longitude: Double,
        @Param("latitude") latitude: Double
    ): Point
}