package com.example.pathapi.repository.projection

interface WayView {

    fun getId(): Long
    fun getCost(): Double
    fun getLength(): Double
    fun getReverseCost(): Double
    fun getSourceId(): Long
    fun getSourceLon(): Double
    fun getSourceLat(): Double
    fun getTargetId(): Long
    fun getTargetLon(): Double
    fun getTargetLat(): Double
}