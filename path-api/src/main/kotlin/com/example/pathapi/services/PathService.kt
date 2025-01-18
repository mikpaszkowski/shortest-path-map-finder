package com.example.pathapi.services

import com.example.pathapi.api.RoutePreference
import com.example.pathapi.dtos.NearestPointDTO
import com.example.pathapi.dtos.PathSegmentDTO
import com.example.pathapi.repository.PathRepository
import com.example.pathapi.repository.projection.WayView
import org.springframework.stereotype.Service

@Service
class PathService(private val pathRepository: PathRepository) {

    fun getNearestPoint(lat: Double, lon: Double): NearestPointDTO {
      return pathRepository.findNearestPoint(lat, lon)
    }

    fun getShortestPath(
        tripEndPoints: Pair<Long, Long>,
        routePreference: RoutePreference,
        isBuiltIn: Boolean,
        ): List<PathSegmentDTO> {
        return if (isBuiltIn) return this.getShortestPathBuiltIn(tripEndPoints, routePreference)
        else this.getShortestPathCustom(tripEndPoints, routePreference)
    }

   private  fun getShortestPathBuiltIn(
        tripEndPoints: Pair<Long, Long>,
        routePreference: RoutePreference,

    ): List<PathSegmentDTO> {
        if(routePreference == RoutePreference.DISTANCE) {
            return pathRepository.findShortestPathWithDistanceCost(tripEndPoints.first, tripEndPoints.second)
        }
        return pathRepository.findShortestPathWithTimeCost(tripEndPoints.first, tripEndPoints.second)
    }

    private fun getShortestPathCustom(sourceTarget: Pair<Long, Long>, routePreference: RoutePreference): List<PathSegmentDTO> {
        val (sourceId, targetId) = sourceTarget

        // Fetch all ways from the database
        val ways = pathRepository.findAllInRange(sourceId, 1000.0)

        // Build the graph
        val graph = buildGraph(ways, routePreference)

        // Run Dijkstra algorithm
        val dijkstra = DijkstraAlgorithm()
        val result = dijkstra.findShortestPath(sourceId, targetId, graph)

        // Convert the result to PathSegmentDTO
        val segments = pathRepository.findAllByGivenPathOfIds(result.path)

        val pathIndexMap = result.path.withIndex().associate { it.value to it.index }

        return segments.sortedBy { pathIndexMap[it.edge] }
    }

    fun getShortestPathWithIntermediatePoints(
        tripEndPoints: Pair<Long, Long>,
        intermediatePoints: List<Long>,
        routePreference: RoutePreference
    ): List<PathSegmentDTO> {
        val wayPoints = mutableListOf<Long>()
        wayPoints.add(tripEndPoints.first)
        wayPoints.addAll(intermediatePoints)
        wayPoints.add(tripEndPoints.second)
        return pathRepository.findPathWithWaypoints(wayPoints.joinToString(","))
    }

    private fun buildGraph(ways: List<WayView>, routePreference: RoutePreference): Map<Long, List<GraphEdge>> {
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
                        .add(GraphEdge(targetNode = targetId, cost = cost, wayId = way.getId()!!))

                    // Add reverse edge if applicable
                    if (way.getReverseCost() != null) {
                        graph.computeIfAbsent(targetId) { mutableListOf() }
                            .add(GraphEdge(targetNode = sourceId, cost = way.getReverseCost()!!, wayId = way.getId()!!))
                    }
                }
            }
        }

        // Remove non-distinct nodes from the graph
        graph.keys.retainAll(distinctNodes)

        return graph
    }

}