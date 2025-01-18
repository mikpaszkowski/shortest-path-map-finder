package com.example.pathapi.services

import java.util.*
import kotlin.math.abs

data class GraphEdge(
    val targetNode: Long,
    val cost: Double,
    val wayId: Long
)

data class DijkstraResult(
    val path: List<Long>,
    val totalCost: Double
)

class DijkstraAlgorithm {

    fun findShortestPath(
        sourceId: Long,
        targetId: Long,
        graph: Map<Long, List<GraphEdge>>
    ): DijkstraResult {
        val distances = mutableMapOf<Long, Double>().withDefault { Double.MAX_VALUE }
        val previousNodes = mutableMapOf<Long, Pair<Long?, Long?>>() // Pair<PreviousNode, WayId>
        val priorityQueue = PriorityQueue<Pair<Long, Double>>(compareBy { it.second })

        distances[sourceId] = 0.0
        priorityQueue.add(sourceId to 0.0)

        while (priorityQueue.isNotEmpty()) {
            val (currentNode, currentDistance) = priorityQueue.poll()

            // If we reached the target node, stop processing
            if (currentNode == targetId) break

            // Skip processing if the current distance is greater than the recorded distance
            if (currentDistance > distances.getValue(currentNode)) continue

            // Process neighbors
            val neighbors = graph[currentNode] ?: emptyList()
            for (edge in neighbors) {
                val newDistance = currentDistance + abs(edge.cost)
                if (newDistance < distances.getValue(edge.targetNode)) {
                    distances[edge.targetNode] = newDistance
                    previousNodes[edge.targetNode] = currentNode to edge.wayId
                    priorityQueue.add(Pair(edge.targetNode, newDistance))
                }
            }
        }

        // Backtrack to find the wayIds
        val wayIds = mutableListOf<Long>()
        var currentNode: Long? = targetId
        while (currentNode != null && currentNode != sourceId) {
            val (previousNode, wayId) = previousNodes[currentNode] ?: break
            if (wayId != null) wayIds.add(wayId)
            currentNode = previousNode
        }
        wayIds.reverse()

        return DijkstraResult(wayIds, distances.getValue(targetId))
    }
}