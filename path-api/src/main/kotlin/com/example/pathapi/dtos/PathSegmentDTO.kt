package com.example.pathapi.dtos

import com.example.pathapi.config.LineStringSerializer
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import jakarta.persistence.*

import org.locationtech.jts.geom.LineString

@Entity
data class PathSegmentDTO(
    @Id
    @Column(name = "seq", nullable = false)
    val seq: Int,
    @Column(name = "node", nullable = false)
    val node: Long,
    @Column(name = "edge", nullable = false)
    val edge: Long,

    @Column(name = "startLongitude", nullable = false)
    val startLongitude: Double,
    @Column(name = "startLatitude", nullable = false)
    val startLatitude: Double,
    @Column(name = "endLongitude", nullable = false)
    val endLongitude: Double,
    @Column(name = "endLatitude", nullable = false)
    val endLatitude: Double,

    @Column(name = "geometry", nullable = false)
    @JsonSerialize(using = LineStringSerializer::class)
    val geometry: LineString,

    @Column(name = "cost", nullable = false)
    val cost: Double
)