package com.example.pathapi.services

import com.example.pathapi.api.RoutePreference
import com.example.pathapi.dtos.NearestPointDTO
import com.example.pathapi.dtos.PathSegmentDTO
import com.example.pathapi.repository.PathRepository
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.Geometry
import org.locationtech.jts.geom.Point
import org.locationtech.jts.io.WKTReader
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

@Service
class PathService(private val pathRepository: PathRepository) {

    fun getNearestPoint(lat: Double, lon: Double): NearestPointDTO {
      return pathRepository.findNearestPoint(lat, lon)
//          .let {
//          NearestPointDTO(
//              id = it.factory.srid.toLong(),
//              latitude = it.y,
//              longitude = it.x
//          )
      }

    fun getShortestPath(
        sourceId: Long,
        targetId: Long,
        routePreference: RoutePreference
    ): List<PathSegmentDTO> {
        return pathRepository.findShortestPath(sourceId, targetId)
    }

    fun getShortestPathWithIntermediatePoints(
        sourceId: Long,
        targetId: Long,
        intermediatePoints: List<Long>,
        routePreference: RoutePreference
    ): List<PathSegmentDTO> {
        val wayPoints = mutableListOf<Long>()
        wayPoints.add(sourceId)
        wayPoints.addAll(intermediatePoints)
        wayPoints.add(targetId)
        return pathRepository.findPathWithWaypoints(wayPoints.joinToString(","))
    }
}