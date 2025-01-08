package com.example.pathapi.services

import com.example.pathapi.dtos.NearestPointDTO
import com.example.pathapi.repository.PathRepository
import org.locationtech.jts.geom.Geometry
import org.locationtech.jts.geom.Point
import org.locationtech.jts.io.WKTReader
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

@Service
class PathService(private val pathRepository: PathRepository) {

    fun getNearestPoint(lat: Double, lon: Double): NearestPointDTO {
      return pathRepository.findNearestPoint(lat, lon).let {
          NearestPointDTO(
              id = it.factory.srid.toLong(),
              latitude = it.y,
              longitude = it.x
          )
      }
    }
}