package com.example.pathapi.dtos


data class ShortestPathOutput(
    val path: List<PathSegmentDTO>,
    val totalCost: Double,
)