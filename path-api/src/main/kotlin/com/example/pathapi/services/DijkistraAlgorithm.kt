package com.example.pathapi.services

import java.util.*
import kotlin.math.abs

data class GraphEdge(
    val targetNode: Long,
    val cost: Double,
    val wayId: Long,
    val sourceLat: Double,
    val sourceLon: Double,
    val targetLat: Double,
    val targetLon: Double
)

data class DijkstraResult(
    val path: List<Long>,
    val totalCost: Double
)

data class Vector(val x: Double, val y: Double)

class DijkstraAlgorithm {

    private val LEFT_TURN_PENALTY = 15

    fun findShortestPath(
        sourceId: Long,
        targetId: Long,
        graph: Map<Long, List<GraphEdge>>,
        isLeftTurnAllowed: Boolean = false
    ): DijkstraResult {
        val distances = mutableMapOf<Long, Double>().withDefault { Double.MAX_VALUE }
        val previousNodes = mutableMapOf<Long, Pair<Long?, Long?>>() // Pair<PreviousNode, WayId>
        val priorityQueue = PriorityQueue<Pair<Long, Double>>(compareBy { it.second })
        val previousEdges = mutableMapOf<Long, GraphEdge>()  // Przechowujemy poprzednie krawędzie

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
                var newDistance = currentDistance + abs(edge.cost)

                if(isLeftTurnAllowed) {
                    // Sprawdzamy, czy to skręt w lewo
                    val lastEdge = previousEdges[currentNode]
                    if (lastEdge != null) {
                        val isLeftTurn = isLeftTurn(lastEdge, edge)
                        if (isLeftTurn) {
                            println("Skręt w lewo: ${lastEdge.wayId} -> ${edge.wayId}")
                            // Dodajemy karę za skręt w lewo
                            newDistance *= LEFT_TURN_PENALTY
                        }
                    }
                }

                if (newDistance < distances.getValue(edge.targetNode)) {
                    distances[edge.targetNode] = newDistance
                    previousNodes[edge.targetNode] = currentNode to edge.wayId
                    previousEdges[edge.targetNode] = edge
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

    // Funkcja do obliczania iloczynu wektorowego
    private fun crossProduct(v1: Vector, v2: Vector): Double {
        return v1.x * v2.y - v1.y * v2.x
    }

    // Funkcja do sprawdzania, czy to skręt w lewo
    private fun isLeftTurn(lastEdge: GraphEdge, currentEdge: GraphEdge): Boolean {
        val lastVector = Vector(
            x = lastEdge.targetLon - lastEdge.sourceLon,
            y = lastEdge.targetLat - lastEdge.sourceLat
        )
        val currentVector = Vector(
            x = currentEdge.targetLon - currentEdge.sourceLon,
            y = currentEdge.targetLat - currentEdge.sourceLat
        )

        // Obliczamy iloczyn wektorowy
        val crossProd = crossProduct(lastVector, currentVector)

        if (abs(crossProd) < 1E-8) {
            println("Krawędzie są prawie współliniowe: ${lastEdge.wayId} -> ${currentEdge.wayId} | ${lastEdge.sourceLat}, ${lastEdge.sourceLon}, ${lastEdge.targetLat}, ${lastEdge.targetLon} | (${currentEdge.sourceLat}, ${currentEdge.sourceLon}), (${currentEdge.targetLat}, ${currentEdge.targetLon})")
            return false
        }
        // Jeśli iloczyn wektorowy jest dodatni, to skręt jest w lewo
        if(crossProd < 0) println("Ujemny iloczyn wektorowy: ${lastEdge.wayId} -> ${currentEdge.wayId} | ${lastEdge.sourceLat}, ${lastEdge.sourceLon}, ${lastEdge.targetLat}, ${lastEdge.targetLon} | (${currentEdge.sourceLat}, ${currentEdge.sourceLon}), (${currentEdge.targetLat}, ${currentEdge.targetLon})")
        if(crossProd >= 0) println("Dodatni | 0 iloczyn wektorowy: ${lastEdge.wayId} -> ${currentEdge.wayId} | ${lastEdge.sourceLat}, ${lastEdge.sourceLon}, ${lastEdge.targetLat}, ${lastEdge.targetLon} | (${currentEdge.sourceLat}, ${currentEdge.sourceLon}), (${currentEdge.targetLat}, ${currentEdge.targetLon})")
        return crossProd > 0
    }
}