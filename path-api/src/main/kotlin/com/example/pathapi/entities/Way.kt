package com.example.pathapi.entities

import jakarta.persistence.*
import org.locationtech.jts.geom.LineString

@Entity
@Table(name = "ways", schema = "public")
class Way {
    @Id
    @Column(name = "gid", nullable = false)
    var id: Long? = null

    @Column(name = "osm_id")
    var osmId: Long? = null

    @Column(name = "length")
    var length: Double? = null

    @Column(name = "length_m")
    var lengthM: Double? = null

    @Column(name = "name", length = Integer.MAX_VALUE)
    var name: String? = null

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source")
    var source: WaysVerticesPgr? = null

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target")
    var target: WaysVerticesPgr? = null

    @Column(name = "cost")
    var cost: Double? = null

    @Column(name = "reverse_cost")
    var reverseCost: Double? = null

    @Column(name = "cost_s")
    var costS: Double? = null

    @Column(name = "reverse_cost_s")
    var reverseCostS: Double? = null

    @Column(name = "rule", length = Integer.MAX_VALUE)
    var rule: String? = null

    @Column(name = "one_way")
    var oneWay: Int? = null

    @Column(name = "oneway", length = Integer.MAX_VALUE)
    var oneway: String? = null

    @Column(name = "x1")
    var x1: Double? = null

    @Column(name = "y1")
    var y1: Double? = null

    @Column(name = "x2")
    var x2: Double? = null

    @Column(name = "y2")
    var y2: Double? = null

    @Column(name = "maxspeed_forward")
    var maxspeedForward: Double? = null

    @Column(name = "maxspeed_backward")
    var maxspeedBackward: Double? = null

    @Column(name = "priority")
    var priority: Double? = null

    @Column(name = "the_geom", columnDefinition = "geometry(LineString, 4326)")
    private var theGeom: LineString? = null

    /*
            TODO [JPA Buddy] create field to map the 'the_geom' column
             Available actions: Define target Java type | Uncomment as is | Remove column mapping
            @Column(name = "the_geom", columnDefinition = "geometry(0, 0)")
            var theGeom: Any? = null
        */
}
