/**
 * PathRenderer - Visualizes routes on the map
 * Renders path lines, waypoints, and direction indicators
 */
import maplibregl from 'maplibre-gl';

export class PathRenderer {
    constructor(map, layerManager) {
        this.map = map;
        this.layerManager = layerManager;
        this.currentRoute = null;
    }

    /**
     * Render a route on the map
     */
    renderRoute(route, options = {}) {
        const {
            color = '#4285F4',
            width = 4,
            showWaypoints = true,
            animated = true
        } = options;

        // Clear existing route
        this.clearRoute();

        // Store current route
        this.currentRoute = route;

        // Add route line
        const routeSourceId = 'route-line-source';
        const routeLayerId = 'route-line-layer';

        this.map.addSource(routeSourceId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: route.path
                }
            }
        });

        // Add animated layer (dashed line that moves)
        if (animated) {
            this.map.addLayer({
                id: `${routeLayerId}-animated`,
                type: 'line',
                source: routeSourceId,
                paint: {
                    'line-color': color,
                    'line-width': width,
                    'line-dasharray': [0, 4, 3]
                }
            });

            // Animate the dash
            this.animateDashArray(`${routeLayerId}-animated`);
        }

        // Add main route line
        this.map.addLayer({
            id: routeLayerId,
            type: 'line',
            source: routeSourceId,
            paint: {
                'line-color': color,
                'line-width': width,
                'line-opacity': 0.8
            }
        });

        // Add waypoint markers if enabled
        if (showWaypoints && route.segments) {
            this.renderWaypoints(route);
        }

        // Add start/end markers
        this.renderStartEndMarkers(route);
    }

    /**
     * Animate dash array for moving effect
     */
    animateDashArray(layerId) {
        let step = 0;
        const dashArraySequence = [
            [0, 4, 3],
            [0.5, 4, 2.5],
            [1, 4, 2],
            [1.5, 4, 1.5],
            [2, 4, 1],
            [2.5, 4, 0.5],
            [3, 4, 0],
            [0, 0.5, 3, 3.5],
            [0, 1, 3, 3],
            [0, 1.5, 3, 2.5],
            [0, 2, 3, 2],
            [0, 2.5, 3, 1.5],
            [0, 3, 3, 1]
        ];

        const animate = () => {
            if (!this.map.getLayer(layerId)) return;

            step = (step + 1) % dashArraySequence.length;
            this.map.setPaintProperty(
                layerId,
                'line-dasharray',
                dashArraySequence[step]
            );

            requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Render waypoint markers for floor changes
     */
    renderWaypoints(route) {
        route.segments.forEach((segment, index) => {
            if (segment.floorChange) {
                // Add marker at floor transition point
                const marker = document.createElement('div');
                marker.className = 'route-waypoint';
                marker.innerHTML = segment.fromFloor !== segment.toFloor
                    ? '🔄'
                    : '•';
                marker.style.cssText = `
                    width: 24px;
                    height: 24px;
                    background: #4285F4;
                    border: 2px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                `;

                new maplibregl.Marker(marker)
                    .setLngLat(segment.fromCoords)
                    .addTo(this.map);
            }
        });
    }

    /**
     * Render start and end markers
     */
    renderStartEndMarkers(route) {
        // Start marker (green)
        const startMarker = document.createElement('div');
        startMarker.className = 'route-start-marker';
        startMarker.innerHTML = '📍';
        startMarker.style.cssText = `
            width: 32px;
            height: 32px;
            background: #34A853;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
            cursor: pointer;
        `;

        new maplibregl.Marker(startMarker)
            .setLngLat(route.path[0])
            .addTo(this.map);

        // End marker (red)
        const endMarker = document.createElement('div');
        endMarker.className = 'route-end-marker';
        endMarker.innerHTML = '🎯';
        endMarker.style.cssText = `
            width: 32px;
            height: 32px;
            background: #EA4335;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
            cursor: pointer;
        `;

        new maplibregl.Marker(endMarker)
            .setLngLat(route.path[route.path.length - 1])
            .addTo(this.map);
    }

    /**
     * Clear current route from map
     */
    clearRoute() {
        // Remove layers
        ['route-line-layer', 'route-line-layer-animated'].forEach(layerId => {
            if (this.map.getLayer(layerId)) {
                this.map.removeLayer(layerId);
            }
        });

        // Remove source
        if (this.map.getSource('route-line-source')) {
            this.map.removeSource('route-line-source');
        }

        // Remove markers
        document.querySelectorAll('.route-waypoint, .route-start-marker, .route-end-marker')
            .forEach(el => el.remove());

        this.currentRoute = null;
    }

    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
}
