package com.example.pathapi.services

import com.example.pathapi.api.RoutePreference
import com.example.pathapi.dtos.NearestPointDTO
import com.example.pathapi.dtos.ShortestPathOutput
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
        minimizeLeftTurns: Boolean
    ): ShortestPathOutput {
        return if (isBuiltIn) return this.getShortestPathBuiltIn(tripEndPoints, routePreference)
        else this.getShortestPathCustom(tripEndPoints, routePreference, minimizeLeftTurns)
    }

    fun getShortestPathWithIntermediatePoints(
        tripEndPoints: Pair<Long, Long>,
        intermediatePoints: List<Long>,
        routePreference: RoutePreference,
        isBuiltIn: Boolean,
        minimizeLeftTurns: Boolean
    ): ShortestPathOutput {
        if(isBuiltIn) {
            return getShortestPathWithIntermediatePointsBuiltIn(tripEndPoints, intermediatePoints, routePreference, minimizeLeftTurns)
        }
        return getShortestPathCustomWithIntermediatePoints(tripEndPoints, intermediatePoints, routePreference, minimizeLeftTurns)
    }

    private fun getShortestPathWithIntermediatePointsBuiltIn(
        tripEndPoints: Pair<Long, Long>,
        intermediatePoints: List<Long>,
        routePreference: RoutePreference,
        minimizeLeftTurns: Boolean
    ): ShortestPathOutput {
        val wayPoints = mutableListOf<Long>()
        wayPoints.add(tripEndPoints.first)
        wayPoints.addAll(intermediatePoints)
        wayPoints.add(tripEndPoints.second)

        val wayPointsJoined = wayPoints.joinToString(",")

        val pathSegments = if(routePreference == RoutePreference.DISTANCE) pathRepository.findPathWithWaypointsWithMinDist(wayPointsJoined)
        else pathRepository.findPathWithWaypointsWithMinTime(wayPointsJoined)
        return ShortestPathOutput(
            path = pathSegments,
            totalCost = pathRepository.getTotalCostOfEdges(pathSegments.map { it.edge }.joinToString(","), routePreference.value),
        )
    }

    private fun getShortestPathBuiltIn(
        tripEndPoints: Pair<Long, Long>,
        routePreference: RoutePreference,
        ): ShortestPathOutput {
        val pathSegments = if (routePreference == RoutePreference.DISTANCE) {
            pathRepository.findShortestPathWithDistanceCost(tripEndPoints.first, tripEndPoints.second)
        } else {
            pathRepository.findShortestPathWithTimeCost(tripEndPoints.first, tripEndPoints.second)
        }
        return ShortestPathOutput(
            path = pathSegments,
            totalCost = pathRepository.getTotalCostOfEdges(pathSegments.map { it.edge }.joinToString(","), routePreference.value),
        )
    }

    private fun getShortestPathCustom(
        sourceTarget: Pair<Long, Long>,
        routePreference: RoutePreference,
        minimizeLeftTurns: Boolean = false
    ): ShortestPathOutput {
        val (sourceId, targetId) = sourceTarget

        // Fetch all ways from the database
        val ways = pathRepository.findAllInRange(sourceId, 1000.0)

        // Build the graph
        val graphBuilder = GraphBuilder()
        val graph = graphBuilder.buildGraph(ways, routePreference)

        // Run Dijkstra algorithm
        val dijkstra = DijkstraAlgorithm()
        val result = dijkstra.findShortestPath(sourceId, targetId, graph, minimizeLeftTurns)

        // Convert the result to PathSegmentDTO
        val segments = pathRepository.findAllByGivenPathOfIds(result.path.joinToString(","), routePreference.value)

        val pathIndexMap = result.path.withIndex().associate { it.value to it.index }

        return ShortestPathOutput(
            path = segments.sortedBy { pathIndexMap[it.edge] },
            totalCost = segments.sumOf { it.cost },
        )
    }

    private fun getShortestPathCustomWithIntermediatePoints(
        sourceTarget: Pair<Long, Long>,
        intermediatePoints: List<Long>,
        routePreference: RoutePreference,
        minimizeLeftTurns: Boolean = false
    ): ShortestPathOutput {
        val (sourceId, targetId) = sourceTarget

        //prepare a single list of all nodes
        val wayPoints = mutableListOf<Long>()
        wayPoints.add(sourceId)
        wayPoints.addAll(intermediatePoints)
        wayPoints.add(targetId)

        //iterate through each pair (start, n1, n2, n3, end) -> start -> n1, n1 -> n2, n2 -> n3, n3 -> end
        val graphBuilder = GraphBuilder()
        val pathSegments = mutableListOf<Long>()
        for(i in 0 until wayPoints.size - 1) {
            val start = wayPoints[i]
            val end = wayPoints[i + 1]
            val ways = pathRepository.findAllInRange(start, 1000.0)

            val graph = graphBuilder.buildGraph(ways, routePreference)
            val dijkstra = DijkstraAlgorithm()
            val result = dijkstra.findShortestPath(start, end, graph, minimizeLeftTurns)
            pathSegments.addAll(result.path)
        }

        // Convert the result to PathSegmentDTO
        val segments = pathRepository.findAllByGivenPathOfIds(pathSegments.joinToString(","), routePreference.value)

        val pathIndexMap = pathSegments.withIndex().associate { it.value to it.index }

        return ShortestPathOutput(
            path = segments.sortedBy { pathIndexMap[it.edge] },
            totalCost = segments.sumOf { it.cost },
        )
    }
}