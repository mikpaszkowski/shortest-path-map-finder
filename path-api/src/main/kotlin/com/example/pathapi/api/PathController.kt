package com.example.pathapi.api

import com.example.pathapi.dtos.NearestPointDTO
import com.example.pathapi.services.PathService
import org.locationtech.jts.geom.Point
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
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
}