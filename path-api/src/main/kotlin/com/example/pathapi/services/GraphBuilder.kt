package com.example.pathapi.services

import com.example.pathapi.api.RoutePreference
import com.example.pathapi.repository.projection.WayView

class GraphBuilder {

    fun buildGraph(ways: List<WayView>, routePreference: RoutePreference): Map<Long, List<GraphEdge>> {
        val graph = mutableMapOf<Long, MutableList<GraphEdge>>()
        val distinctNodes = mutableSetOf<Long>() // Set to track distinct nodes

        for (way in ways) {
            val cost = when (routePreference) {
                RoutePreference.TIME -> way.getCost() ?: Double.MAX_VALUE
                RoutePreference.DISTANCE -> way.getLength() ?: Double.MAX_VALUE
            }
            way.getSourceId()?.let { sourceId ->
                way.getTargetId()?.let { targetId ->
                    // Add nodes to the distinct set
                    distinctNodes.add(sourceId)
                    distinctNodes.add(targetId)

                    // Build graph edges
                    graph.computeIfAbsent(sourceId) { mutableListOf() }
                        .add(GraphEdge(
                            targetNode = targetId,
                            cost = cost,
                            wayId = way.getId(),
                            sourceLat = way.getSourceLat(),  // Współrzędne źródła
                            sourceLon = way.getSourceLon(),  // Współrzędne źródła
                            targetLat = way.getTargetLat(),  // Współrzędne celu
                            targetLon = way.getTargetLon()   // Współrzędne celu
                        ))

                    // Add reverse edge if applicable
                    if (way.getReverseCost() != null) {
                        graph.computeIfAbsent(targetId) { mutableListOf() }
                            .add(GraphEdge(targetNode = sourceId,
                                cost = way.getReverseCost(),
                                wayId = way.getId(),
                                sourceLat = way.getTargetLat(),  // Współrzędne źródła
                                sourceLon = way.getTargetLon(),  // Współrzędne źródła
                                targetLat = way.getSourceLat(),  // Współrzędne celu
                                targetLon = way.getSourceLon()   // Współrzędne celu
                            ))
                    }
                }
            }
        }

        // Remove non-distinct nodes from the graph
        graph.keys.retainAll(distinctNodes)
        return graph
    }
}