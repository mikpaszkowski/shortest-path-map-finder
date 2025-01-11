package com.example.pathapi.config

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.SerializerProvider
import org.locationtech.jts.geom.LineString

class LineStringSerializer : JsonSerializer<LineString>() {

    override fun serialize(value: LineString?, gen: JsonGenerator, serializers: SerializerProvider) {
        if (value == null) {
            gen.writeNull()
            return
        }

        // Extract the coordinates from the LineString's CoordinateSequence
        val coordinatesList = mutableListOf<DoubleArray>()
        val coordinateSequence = value.coordinateSequence

        for (i in 0 until coordinateSequence.size()) {
            val x = coordinateSequence.getX(i)
            val y = coordinateSequence.getY(i)
            coordinatesList.add(doubleArrayOf(x, y))
        }

        // Serialize as a GeoJSON object
        gen.writeStartObject()
        gen.writeStringField("type", "LineString")
        gen.writeFieldName("coordinates")

        // Serialize the coordinates array
        gen.writeStartArray()
        for (coordinate in coordinatesList) {
            gen.writeArray(coordinate, 0, coordinate.size)
        }
        gen.writeEndArray()

        gen.writeEndObject()
    }
}