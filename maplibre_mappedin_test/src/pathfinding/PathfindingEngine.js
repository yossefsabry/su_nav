import { Graph } from './core/Graph.js';
import { CollisionDetector } from './core/CollisionDetector.js';
import { EdgeBuilder } from './core/EdgeBuilder.js';
import { AStar } from './core/AStar.js';
import { ConnectionHandler } from './multi-floor/ConnectionHandler.js';

/**
 * PathfindingEngine - Main orchestrator for the pathfinding system
 * Coordinates graph construction, pathfinding, and route generation
 */
export class PathfindingEngine {
    constructor() {
        this.graph = new Graph();
        this.collisionDetector = new CollisionDetector();
        this.aStar = null; // Will be initialized after graph is built
        this.initialized = false;
    }

    /**
     * Initialize the pathfinding engine with MVF data
     */
    async initialize(nodeFeatures, geometry, connections, walkableData, nonwalkableData, kindsData, entranceNodesData = null) {
        console.log('🚀 Initializing Pathfinding Engine...');

        // 1. Initialize collision detector
        console.log('Step 1: Building collision detector...');
        this.collisionDetector.initialize(geometry, nonwalkableData, kindsData);

        // 2. Load nodes into graph
        console.log('Step 2: Loading nodes into graph...');

        // Load standard pathfinding nodes
        nodeFeatures.forEach(feature => {
            const id = feature.properties.id;
            const coords = feature.geometry.coordinates;
            const floorId = feature.properties.floorId;

            this.graph.addNode(id, coords, floorId, {
                geometryIds: feature.properties.geometryIds || [],
                type: 'waypoint'
            });
        });

        // Load entrance nodes if provided
        if (entranceNodesData && entranceNodesData.features) {
            console.log(`  Loading ${entranceNodesData.features.length} entrance nodes...`);
            entranceNodesData.features.forEach(feature => {
                // Use geometryId or generate a unique ID
                const id = feature.properties.geometryId || feature.id || `entrance_${Math.random().toString(36).substr(2, 9)}`;
                const coords = feature.geometry.coordinates;
                // Entrance nodes might not have floorId in properties if raw geojson, check struct
                // Based on standard geojson features from extractors, they should have it or we infer it
                // We'll rely on it being present or handled upstream. 
                // However, based on mvf-loader, we might need to ensure floorId is there. 
                // If not present in properties, we can try to find nearest floor or assume checks done.
                // Assuming well-formed data from script.js injection:
                const floorId = feature.properties.floorId;

                if (floorId) {
                    this.graph.addNode(id, coords, floorId, {
                        type: 'entrance',
                        ...feature.properties
                    });
                }
            });
        }

        console.log(`  Loaded ${this.graph.nodes.size} nodes`);

        // 3. Build spatial indexes
        console.log('Step 3: Building spatial indexes...');
        this.graph.buildSpatialIndexes();

        // 4. Build edges using visibility graph
        console.log('Step 4: Building visibility graph edges...');
        const edgeBuilder = new EdgeBuilder(this.collisionDetector);
        edgeBuilder.buildAllEdges(this.graph);

        // 5. Process connections (elevators, stairs, doors)
        console.log('Step 5: Processing multi-floor connections...');
        const connectionHandler = new ConnectionHandler(this.graph);
        connectionHandler.processConnections(connections);
        connectionHandler.tagNodes(connections);

        // 6. Initialize A* with built graph
        console.log('Step 6: Initializing A* pathfinder...');
        this.aStar = new AStar(this.graph);

        // 7. Print statistics
        const stats = this.graph.getStats();
        console.log('✅ Pathfinding Engine Initialized!');
        console.log('Graph Statistics:');
        console.log(`  Nodes: ${stats.nodeCount}`);
        console.log(`  Edges: ${stats.edgeCount}`);
        console.log(`  Floors: ${stats.floors}`);
        console.log(`  Avg Edges/Node: ${stats.avgEdgesPerNode.toFixed(2)}`);

        this.initialized = true;
        return true;
    }

    /**
     * Find a route between two coordinates
     */
    findRoute(startCoords, endCoords, startFloorId, endFloorId, options = {}) {
        if (!this.initialized) {
            throw new Error('PathfindingEngine not initialized. Call initialize() first.');
        }

        console.log(`Finding route from ${startFloorId} to ${endFloorId}...`);

        // 1. Find nearest nodes to start and end coordinates
        const startNode = this.graph.findNearestNode(startCoords, startFloorId);
        const endNode = this.graph.findNearestNode(endCoords, endFloorId);

        if (!startNode || !endNode) {
            console.error('Could not find nodes near coordinates');
            return null;
        }

        console.log(`  Start node: ${startNode.id}`);
        console.log(`  End node: ${endNode.id}`);

        // 2. Run A* pathfinding
        const path = this.aStar.findPath(startNode.id, endNode.id, options);

        if (!path) {
            console.warn('No path found');
            return null;
        }

        console.log(`  Path found: ${path.nodeIds.length} nodes, ${path.distance.toFixed(2)}m`);

        return {
            path: path.coords,
            nodeIds: path.nodeIds,
            distance: path.distance,
            floors: path.floors,
            segments: path.segments,
            startNode: startNode,
            endNode: endNode
        };
    }

    /**
     * Find an accessible route (no stairs)
     */
    findAccessibleRoute(startCoords, endCoords, startFloorId, endFloorId) {
        return this.findRoute(startCoords, endCoords, startFloorId, endFloorId, {
            accessibleOnly: true,
            avoidStairs: true
        });
    }

    /**
     * Get the graph for external use (debugging, visualization)
     */
    getGraph() {
        return this.graph;
    }

    /**
     * Get collision detector for external use
     */
    getCollisionDetector() {
        return this.collisionDetector;
    }
}
