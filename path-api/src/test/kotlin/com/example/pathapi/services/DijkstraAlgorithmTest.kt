package com.example.pathapi.services

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test


class DijkstraAlgorithmTest {

    private val algorithm = DijkstraAlgorithm()

    @Test
    fun `test shortest path without left turns`() {
        val graph = mapOf(
            1L to listOf(
                GraphEdge(2L, 5.0, 1L, 0.0, 0.0, 1.0, 0.0),
                GraphEdge(3L, 10.0, 2L, 0.0, 0.0, 0.0, 1.0)
            ),
            2L to listOf(
                GraphEdge(4L, 3.0, 3L, 1.0, 0.0, 2.0, 0.0)
            ),
            3L to listOf(
                GraphEdge(4L, 2.0, 4L, 0.0, 1.0, 2.0, 0.0)
            ),
            4L to emptyList()
        )

        val result = algorithm.findShortestPath(1L, 4L, graph, isLeftTurnAllowed = false)

        assertEquals(listOf(1L, 3L), result.path)
        assertEquals(13.0, result.totalCost)
    }

    @Test
    fun `test shortest path with left turns`() {
        val graph = mapOf(
            1L to listOf(
                GraphEdge(2L, 5.0, 1L, 1.0, 0.0, 1.0, 2.0),
                GraphEdge(3L, 10.0, 2L, 2.0, 0.0, 2.0, 2.0)
            ),
            2L to listOf(
                GraphEdge(4L, 3.0, 3L, 1.0, 0.0, 2.0, 0.0)
            ),
            3L to listOf(
                GraphEdge(4L, 2.0, 4L, 3.0, 1.0, 2.0, 4.0)
            ),
            4L to emptyList()
        )

        val result = algorithm.findShortestPath(1L, 4L, graph, isLeftTurnAllowed = true)

        // Dodatkowy koszt za lewoskręt na 1L -> 3L oraz 3L -> 4L
        assertEquals(listOf(1L, 2L, 4L), result.path)
        assertEquals(8.0, result.totalCost)
    }

    @Test
    fun `test no path available`() {
        val graph = mapOf(
            1L to listOf(
                GraphEdge(2L, 5.0, 1L, 0.0, 0.0, 1.0, 0.0)
            ),
            2L to emptyList(),
            3L to listOf(
                GraphEdge(4L, 2.0, 2L, 1.0, 0.0, 2.0, 0.0)
            ),
            4L to emptyList()
        )

        val result = algorithm.findShortestPath(1L, 4L, graph, isLeftTurnAllowed = false)

        assertEquals(emptyList<Long>(), result.path)
        assertEquals(Double.MAX_VALUE, result.totalCost)
    }

    @Test
    fun `test alternative paths with left turn penalties`() {
        val graph = mapOf(
            1L to listOf(
                GraphEdge(2L, 5.0, 1L, 0.0, 0.0, 1.0, 0.0),
                GraphEdge(3L, 10.0, 2L, 0.0, 0.0, 0.0, 1.0)
            ),
            2L to listOf(
                GraphEdge(4L, 3.0, 3L, 1.0, 0.0, 2.0, 0.0)
            ),
            3L to listOf(
                GraphEdge(4L, 2.0, 4L, 0.0, 1.0, 2.0, 0.0)
            ),
            4L to emptyList()
        )

        val result = algorithm.findShortestPath(1L, 4L, graph, isLeftTurnAllowed = true)

        assertEquals(listOf(1L, 2L, 4L), result.path)
        assertEquals(8.0, result.totalCost)
    }

    @Test
    fun `test left turn does not affect optimal path`() {
        val graph = mapOf(
            1L to listOf(
                GraphEdge(2L, 1.0, 1L, 0.0, 0.0, 1.0, 0.0),
                GraphEdge(3L, 10.0, 2L, 0.0, 0.0, 0.0, 1.0)
            ),
            2L to listOf(
                GraphEdge(4L, 1.0, 3L, 1.0, 0.0, 2.0, 0.0)
            ),
            3L to listOf(
                GraphEdge(4L, 2.0, 4L, 0.0, 1.0, 2.0, 0.0)
            ),
            4L to emptyList()
        )

        val result = algorithm.findShortestPath(1L, 4L, graph, isLeftTurnAllowed = true)

        assertEquals(listOf(1L, 2L, 4L), result.path)
        assertEquals(2.0, result.totalCost)
    }
}
