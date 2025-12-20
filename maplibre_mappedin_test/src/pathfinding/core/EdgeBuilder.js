import * as turf from '@turf/turf';

/**
 * EdgeBuilder - Constructs edges between nodes using visibility graph algorithm
 * Ensures edges don't pass through walls or obstacles
 */
export class EdgeBuilder {
    constructor(collisionDetector) {
        this.collisionDetector = collisionDetector;
    }

    /**
     * Build edges for all nodes on a floor using visibility graph
     * Only connects nodes that have line-of-sight (no wall collisions)
     */
    buildEdgesForFloor(nodes, floorId, maxDistance = 0.0003) {
        const edges = [];
        console.log(`Building edges for floor ${floorId} with ${nodes.length} nodes...`);

        // For each pair of nodes
        for (let i = 0; i < nodes.length; i++) {
            const nodeA = nodes[i];

            for (let j = i + 1; j < nodes.length; j++) {
                const nodeB = nodes[j];

                // Calculate distance
                const distance = this.calculateDistance(nodeA.coords, nodeB.coords);

                // Skip if too far (optimization)
                if (distance > maxDistance) {
                    continue;
                }

                // Check line-of-sight
                if (this.hasLineOfSight(nodeA.coords, nodeB.coords, floorId)) {
                    // Add bidirectional edge
                    edges.push({
                        from: nodeA.id,
                        to: nodeB.id,
                        weight: distance,
                        type: 'walkable'
                    });
                    edges.push({
                        from: nodeB.id,
                        to: nodeA.id,
                        weight: distance,
                        type: 'walkable'
                    });
                }
            }
        }

        console.log(`  Created ${edges.length} edges`);
        return edges;
    }

    /**
     * Check if two points have line-of-sight (no obstacles between them)
     */
    hasLineOfSight(coordsA, coordsB, floorId) {
        return this.collisionDetector.isPathClear(coordsA, coordsB, floorId);
    }

    /**
     * Calculate Euclidean distance between two points
     */
    calculateDistance(coordsA, coordsB) {
        try {
            return turf.distance(
                turf.point(coordsA),
                turf.point(coordsB),
                { units: 'meters' }
            );
        } catch (e) {
            // Fallback to simple Euclidean distance
            const [lng1, lat1] = coordsA;
            const [lng2, lat2] = coordsB;
            const dx = lng2 - lng1;
            const dy = lat2 - lat1;
            return Math.sqrt(dx * dx + dy * dy) * 111320; // Rough meters conversion
        }
    }

    /**
     * Build all edges for a graph
     */
    buildAllEdges(graph) {
        let totalEdges = 0;

        // Get all floors
        const floors = new Set();
        graph.nodes.forEach(node => floors.add(node.floorId));

        // Build edges for each floor
        floors.forEach(floorId => {
            const nodesOnFloor = graph.getNodesOnFloor(floorId);
            const edges = this.buildEdgesForFloor(nodesOnFloor, floorId);

            // Add edges to graph
            edges.forEach(edge => {
                graph.addEdge(edge.from, edge.to, edge.weight, {
                    type: edge.type
                });
            });

            totalEdges += edges.length;
        });

        console.log(`Total edges built: ${totalEdges}`);
        return totalEdges;
    }
}
