package com.example.pathapi.api

import com.example.pathapi.dtos.NearestPointDTO
import com.example.pathapi.dtos.PathSegmentDTO
import com.example.pathapi.services.PathService
import org.locationtech.jts.geom.Point
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class PathController(private val pathService: PathService) {

    @GetMapping("/nearest-point")
    @CrossOrigin(origins = ["*"])
    fun getNearestPoint(
        @RequestParam longitude: Double,
        @RequestParam latitude: Double
    ): NearestPointDTO {
        return pathService.getNearestPoint(longitude, latitude)
    }

    @GetMapping("/shortest-path")
    @CrossOrigin(origins = ["*"])
    fun getShortestPath(
        @RequestParam sourceId: Long,
        @RequestParam targetId: Long,
        @RequestParam(required = false, defaultValue = "TIME") routePreference: RoutePreference
    ): List<PathSegmentDTO> {
        return pathService.getShortestPath(sourceId, targetId, routePreference)
    }

    @GetMapping("/shortest-path/intermediate-points")
    @CrossOrigin(origins = ["*"])
    fun getShortestPathWithIntermediatePoints(
        @RequestParam sourceId: Long,
        @RequestParam targetId: Long,
        @RequestParam(required = false, defaultValue = "TIME") routePreference: RoutePreference,
        @RequestParam intermediatePoints: List<Long>,
    ): List<PathSegmentDTO> {
        return pathService.getShortestPathWithIntermediatePoints(sourceId, targetId, intermediatePoints, routePreference)
    }
}