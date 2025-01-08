package com.example.pathapi.entities

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.locationtech.jts.geom.LineString
import java.math.BigDecimal

@Entity
@Table(name = "ways_vertices_pgr")
class WaysVerticesPgr {
    @Id
    @Column(name = "id", nullable = false)
    var id: Long? = null

    @Column(name = "osm_id")
    var osmId: Long? = null

    @Column(name = "eout")
    var eout: Int? = null

    @Column(name = "lon", precision = 11, scale = 8)
    var lon: BigDecimal? = null

    @Column(name = "lat", precision = 11, scale = 8)
    var lat: BigDecimal? = null

    @Column(name = "cnt")
    var cnt: Int? = null

    @Column(name = "chk")
    var chk: Int? = null

    @Column(name = "ein")
    var ein: Int? = null

    @Column(name = "the_geom", columnDefinition = "geometry(LineString, 4326)")
    private var theGeom: LineString? = null

    /*
            TODO [JPA Buddy] create field to map the 'the_geom' column
             Available actions: Define target Java type | Uncomment as is | Remove column mapping
            @Column(name = "the_geom", columnDefinition = "geometry(0, 0)")
            var theGeom: Any? = null
        */
}