import * as turf from '@turf/turf';

/**
 * CollisionDetector - Detects collisions with walls and non-walkable areas
 * Uses geometry data to build obstacle polygons and perform line-of-sight checks
 */
export class CollisionDetector {
    constructor() {
        this.obstacles = new Map(); // floorId -> obstacle polygons
        this.walkableAreas = new Map(); // floorId -> walkable polygons
    }

    /**
     * Initialize collision detector with geometry and metadata
     */
    initialize(geometry, nonwalkableData, kindsData) {
        console.log('Initializing CollisionDetector...');

        // Build obstacle polygons from geometry
        geometry.features.forEach(feature => {
            const floorId = feature.properties.floorId;
            const geometryId = feature.properties.id;

            if (!floorId) return;

            // Check if this geometry is a wall (from kinds data)
            const isWall = kindsData && kindsData[geometryId] === 'wall';

            // Check if this geometry is non-walkable
            const isNonwalkable = nonwalkableData && nonwalkableData.has(geometryId);

            if (isWall || isNonwalkable) {
                // Add to obstacles
                if (!this.obstacles.has(floorId)) {
                    this.obstacles.set(floorId, []);
                }

                // Convert to buffered polygon if needed
                let obstaclePolygon = feature;
                if (feature.geometry.type === 'LineString') {
                    // Buffer line to create a polygon
                    try {
                        obstaclePolygon = turf.buffer(feature, 0.5, { units: 'meters' });
                    } catch (e) {
                        console.warn('Failed to buffer line geometry:', e);
                        return;
                    }
                }

                if (obstaclePolygon.geometry.type === 'Polygon' ||
                    obstaclePolygon.geometry.type === 'MultiPolygon') {
                    this.obstacles.get(floorId).push(obstaclePolygon);
                }
            }
        });

        console.log(`built obstacle map for ${this.obstacles.size} floors`);
        this.obstacles.forEach((obstacles, floorId) => {
            console.log(`  Floor ${floorId}: ${obstacles.length} obstacles`);
        });
    }

    /**
     * Check if a line segment intersects any obstacles
     */
    lineIntersectsObstacle(start, end, floorId) {
        const obstacles = this.obstacles.get(floorId);
        if (!obstacles || obstacles.length === 0) {
            return false; // No obstacles on this floor
        }

        try {
            const line = turf.lineString([start, end]);

            // Check intersection with each obstacle
            for (const obstacle of obstacles) {
                const intersection = turf.lineIntersect(line, obstacle);
                if (intersection.features.length > 0) {
                    return true; // Collision detected
                }
            }

            return false; // No collisions
        } catch (e) {
            console.warn('Error checking line intersection:', e);
            return false; // Assume safe if error
        }
    }

    /**
     * Check if a point is inside any obstacle
     */
    pointInObstacle(coords, floorId) {
        const obstacles = this.obstacles.get(floorId);
        if (!obstacles) return false;

        try {
            const point = turf.point(coords);

            for (const obstacle of obstacles) {
                if (turf.booleanPointInPolygon(point, obstacle)) {
                    return true;
                }
            }

            return false;
        } catch (e) {
            console.warn('Error checking point in obstacle:', e);
            return false;
        }
    }

    /**
     * Get all obstacles on a floor (for debugging/visualization)
     */
    getObstaclesOnFloor(floorId) {
        return this.obstacles.get(floorId) || [];
    }

    /**
     * Check if path segment is clear (no obstacles)
     */
    isPathClear(startCoords, endCoords, floorId) {
        // Quick check: are endpoints in obstacles?
        if (this.pointInObstacle(startCoords, floorId) ||
            this.pointInObstacle(endCoords, floorId)) {
            return false;
        }

        // Check line intersection
        return !this.lineIntersectsObstacle(startCoords, endCoords, floorId);
    }

    /**
     * Validate a multi-point path
     */
    validatePath(pathCoords, floorIds) {
        for (let i = 0; i < pathCoords.length - 1; i++) {
            const start = pathCoords[i];
            const end = pathCoords[i + 1];
            const floorId = floorIds[i]; // Use floor of starting point

            if (!this.isPathClear(start, end, floorId)) {
                return {
                    valid: false,
                    failureIndex: i,
                    segment: { start, end }
                };
            }
        }

        return {
            valid: true
        };
    }
}
