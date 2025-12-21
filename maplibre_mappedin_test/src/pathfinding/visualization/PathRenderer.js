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
    /**
     * Render a route on the map
     */
    renderRoute(route, options = {}) {
        const {
            color = '#00E5FF', // Neon Cyan
            width = 5,
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

        // 1. Glow Effect (Underlay)
        this.map.addLayer({
            id: `${routeLayerId}-glow`,
            type: 'line',
            source: routeSourceId,
            paint: {
                'line-color': color,
                'line-width': width * 2,
                'line-opacity': 0.3,
                'line-blur': 3
            }
        });

        // 2. Animated Dash Layer
        if (animated) {
            this.map.addLayer({
                id: `${routeLayerId}-animated`,
                type: 'line',
                source: routeSourceId,
                paint: {
                    'line-color': '#FFFFFF', // White dashes for high contrast
                    'line-width': width,
                    'line-dasharray': [0, 4, 3],
                    'line-opacity': 0.8
                }
            });

            // Animate the dash
            this.animateDashArray(`${routeLayerId}-animated`);
        }

        // 3. Main Route Line
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

        // Add arrows along the path
        this.renderDirectionalArrows(route, color);

        // Add waypoint markers if enabled
        if (showWaypoints && route.segments) {
            this.renderWaypoints(route);
        }

        // Add start/end markers
        this.renderStartEndMarkers(route);
    }

    /**
     * Render directional arrows along the path
     */
    renderDirectionalArrows(route, color) {
        // Add arrows every N meters or at key turns
        const pathCoords = route.path;
        if (pathCoords.length < 2) return;

        // Simple approach: Add an arrow near the end and middle for now
        // A full "arrows along line" implementation often requires a symbol layer with placement: 'line',
        // but text-field icons can be tricky to rotate.
        // Instead, let's place a few fixed HTML markers with rotation. (Simpler for "logic" request)

        // Calculate bearing for the last segment to place the "final approach" arrow
        const end = pathCoords[pathCoords.length - 1];
        const beforeEnd = pathCoords[pathCoords.length - 10] || pathCoords[pathCoords.length - 2];
        // Use a point slightly back to get better direction on curve

        if (!beforeEnd) return;

        const bearing = this.calculateBearing(beforeEnd, end);

        const arrowMarker = document.createElement('div');
        arrowMarker.className = 'route-arrow-marker';
        arrowMarker.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${bearing}deg); filter: drop-shadow(0 0 5px ${color});">
                <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="${color}" stroke="white" stroke-width="2"/>
            </svg>
        `;
        arrowMarker.style.cssText = `
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        `;

        new maplibregl.Marker({ element: arrowMarker, rotationAlignment: 'map', pitchAlignment: 'map' })
            .setLngLat(end)
            // Offset slightly back so it doesn't cover the target dot exactly? 
            // Or maybe placing it ON the line before the end is better.
            .addTo(this.map);

        // Add one in the middle too
        const midIndex = Math.floor(pathCoords.length / 2);
        if (midIndex > 0 && midIndex < pathCoords.length - 1) {
            const mid = pathCoords[midIndex];
            const next = pathCoords[midIndex + 5] || pathCoords[midIndex + 1];
            const midBearing = this.calculateBearing(mid, next);

            const midArrow = arrowMarker.cloneNode(true);
            midArrow.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="transform: rotate(${midBearing}deg); opacity: 0.8;">
                    <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="${color}" stroke="white" stroke-width="2"/>
                </svg>
             `;
            new maplibregl.Marker({ element: midArrow, rotationAlignment: 'map', pitchAlignment: 'map' })
                .setLngLat(mid)
                .addTo(this.map);
        }
    }

    calculateBearing(start, end) {
        const startLat = this.toRad(start[1]);
        const startLng = this.toRad(start[0]);
        const endLat = this.toRad(end[1]);
        const endLng = this.toRad(end[0]);

        const y = Math.sin(endLng - startLng) * Math.cos(endLat);
        const x = Math.cos(startLat) * Math.sin(endLat) -
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
        const brng = this.toDeg(Math.atan2(y, x));
        return (brng + 360) % 360;
    }

    toRad(deg) { return deg * Math.PI / 180; }
    toDeg(rad) { return rad * 180 / Math.PI; }

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
            // Check if layer still exists before animating
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
                    background: #292929;
                    border: 2px solid #00E5FF;
                    color: #fff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    box-shadow: 0 0 8px #00E5FF;
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
        this.injectStyles();

        // Start marker (green)
        const startMarker = document.createElement('div');
        startMarker.className = 'route-start-marker';
        startMarker.innerHTML = '<div style="background: #00E5FF; width: 12px; height: 12px; border-radius: 50%;"></div>';
        startMarker.style.cssText = `
            width: 24px;
            height: 24px;
            background: rgba(0, 229, 255, 0.2);
            border: 2px solid #00E5FF;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 10px #00E5FF;
        `;

        new maplibregl.Marker(startMarker)
            .setLngLat(route.path[0])
            .addTo(this.map);

        // End marker (Pulsing Target)
        const endMarker = document.createElement('div');
        endMarker.className = 'route-end-marker pulsing-marker';
        endMarker.innerHTML = '📍';
        endMarker.style.cssText = `
            font-size: 24px;
            filter: drop-shadow(0 0 10px #FF0055);
        `;

        new maplibregl.Marker(endMarker)
            .setLngLat(route.path[route.path.length - 1])
            .addTo(this.map);
    }

    injectStyles() {
        if (!document.getElementById('path-renderer-styles')) {
            const style = document.createElement('style');
            style.id = 'path-renderer-styles';
            style.innerHTML = `
                @keyframes pulse-ring {
                    0% { transform: scale(0.33); opacity: 1; }
                    80%, 100% { opacity: 0; }
                }
                .pulsing-marker::before {
                    content: '';
                    position: absolute;
                    left: 50%; top: 50%;
                    transform: translate(-50%, -50%);
                    width: 30px; height: 30px;
                    border: 3px solid #FF0055;
                    border-radius: 50%;
                    animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                    pointer-events: none;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Clear current route from map
     */
    clearRoute() {
        // Remove layers
        ['route-line-layer', 'route-line-layer-animated', 'route-line-layer-glow'].forEach(layerId => {
            if (this.map.getLayer(layerId)) {
                this.map.removeLayer(layerId);
            }
        });

        // Remove source
        if (this.map.getSource('route-line-source')) {
            this.map.removeSource('route-line-source');
        }

        // Remove markers
        document.querySelectorAll('.route-waypoint, .route-start-marker, .route-end-marker, .route-arrow-marker')
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
