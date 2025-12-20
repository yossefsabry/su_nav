/**
 * DirectionsUI - Interactive UI for pathfinding
 * Handles click-to-directions and drag-and-drop routing
 */
import maplibregl from 'maplibre-gl';

export class DirectionsUI {
    constructor(map, pathfindingEngine, pathRenderer) {
        this.map = map;
        this.pathfindingEngine = pathfindingEngine;
        this.pathRenderer = pathRenderer;
        this.selectedDestination = null;
        this.isDragging = false;
        this.dragMarker = null;
        this.directionsPanel = null;
        this.currentFloor = null;
    }

    /**
     * Initialize directions UI
     */
    initialize(currentFloor) {
        this.currentFloor = currentFloor;
        this.setupLocationClickHandlers();
    }

    /**
     * Setup click handlers for location labels
     */
    setupLocationClickHandlers() {
        // Listen for custom location-clicked event
        window.addEventListener('location-clicked', (e) => {
            const { name, coords, floorId, locationId } = e.detail;
            this.showDirectionsButton(name, coords, floorId);
        });
    }

    /**
     * Show directions button when location is clicked
     */
    showDirectionsButton(locationName, coords, floorId) {
        // Remove existing panel
        this.hideDirectionsPanel();

        // Store destination
        this.selectedDestination = {
            name: locationName,
            coords: coords,
            floorId: floorId
        };

        // Create panel
        this.directionsPanel = document.createElement('div');
        this.directionsPanel.id = 'directions-panel';
        this.directionsPanel.style.cssText = `
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(30, 30, 30, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            z-index: 1000;
            min-width: 280px;
        `;

        this.directionsPanel.innerHTML = `
            <div style="margin-bottom: 16px;">
                <div style="color: #fff; font-size: 18px; font-weight: 600; margin-bottom: 4px;">
                    ${locationName}
                </div>
                <div style="color: #888; font-size: 12px;">
                    Floor: ${floorId}
                </div>
            </div>
            <button id="directions-btn" style="
                width: 100%;
                background: #4285F4;
                border: none;
                border-radius: 8px;
                padding: 12px;
                color: white;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            ">
                📍 Get Directions
            </button>
            <button id="close-directions-btn" style="
                width: 100%;
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 8px;
                color: #ccc;
                font-size: 12px;
                cursor: pointer;
                margin-top: 8px;
            ">
                Close
            </button>
            <div id="drag-instructions" style="
                display: none;
                margin-top: 16px;
                padding: 12px;
                background: rgba(66, 133, 244, 0.1);
                border-radius: 8px;
                color: #4285F4;
                font-size: 13px;
                text-align: center;
            ">
                🎯 Drag the marker to your starting point
            </div>
        `;

        document.body.appendChild(this.directionsPanel);

        // Add event listeners
        document.getElementById('directions-btn').onclick = () => {
            this.enableDragMode();
        };

        document.getElementById('close-directions-btn').onclick = () => {
            this.hideDirectionsPanel();
        };

        // Add hover effect
        const btn = document.getElementById('directions-btn');
        btn.addEventListener('mouseenter', () => {
            btn.style.background = '#357ae8';
            btn.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.3)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = '#4285F4';
            btn.style.boxShadow = 'none';
        });
    }

    /**
     * Enable drag mode for selecting start point
     */
    enableDragMode() {
        // Show instructions
        document.getElementById('drag-instructions').style.display = 'block';
        document.getElementById('directions-btn').textContent = 'Dragging enabled...';
        document.getElementById('directions-btn').disabled = true;

        // Create draggable marker
        this.createDragMarker();

        // Change cursor
        this.map.getCanvas().style.cursor = 'crosshair';
    }

    /**
     * Create draggable start marker
     */
    createDragMarker() {
        const markerEl = document.createElement('div');
        markerEl.style.cssText = `
            width: 40px;
            height: 40px;
            background: #34A853;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.4);
            cursor: grab;
        `;
        markerEl.innerHTML = '🚶';

        // Start at center of screen
        const center = this.map.getCenter();
        this.dragMarker = new maplibregl.Marker(markerEl, { draggable: true })
            .setLngLat(center)
            .addTo(this.map);

        // Handle drag end
        this.dragMarker.on('dragend', () => {
            const coords = this.dragMarker.getLngLat();
            this.calculateAndShowRoute([coords.lng, coords.lat]);
        });

        // Also allow map click to place marker
        const clickHandler = (e) => {
            const coords = [e.lngLat.lng, e.lngLat.lat];
            this.dragMarker.setLngLat(coords);
            this.calculateAndShowRoute(coords);
            this.map.off('click', clickHandler);
        };

        this.map.on('click', clickHandler);
    }

    /**
     * Calculate and display route
     */
    calculateAndShowRoute(startCoords) {
        if (!this.selectedDestination) return;

        console.log('Calculating route...');
        console.log('From:', startCoords);
        console.log('To:', this.selectedDestination.coords);

        try {
            // Get route from pathfinding engine
            const route = this.pathfindingEngine.findRoute(
                startCoords,
                this.selectedDestination.coords,
                this.currentFloor,
                this.selectedDestination.floorId
            );

            if (route) {
                console.log('Route found! Distance:', route.distance.toFixed(2), 'm');

                // Render route on map
                this.pathRenderer.renderRoute(route, {
                    color: '#4285F4',
                    width: 4,
                    animated: true
                });

                // Update UI
                this.showRouteInfo(route);

                // Change cursor back
                this.map.getCanvas().style.cursor = '';
            } else {
                alert('No route found! Try a different starting point.');
            }
        } catch (error) {
            console.error('Pathfinding error:', error);
            alert('Error calculating route: ' + error.message);
        }
    }

    /**
     * Show route information in panel
     */
    showRouteInfo(route) {
        const instructions = document.getElementById('drag-instructions');
        instructions.innerHTML = `
            <div style="text-align: left;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #34A853;">
                    ✅ Route Found!
                </div>
                <div style="font-size: 12px; color: #ccc; margin-bottom: 4px;">
                    Distance: <strong>${route.distance.toFixed(1)}m</strong>
                </div>
                <div style="font-size: 12px; color: #ccc; margin-bottom: 8px;">
                    Floors: ${[...new Set(route.floors)].length}
                </div>
                <button id="clear-route-btn" style="
                    width: 100%;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    border-radius: 6px;
                    padding: 8px;
                    color: white;
                    font-size: 12px;
                    cursor: pointer;
                    margin-top: 8px;
                ">
                    Clear Route
                </button>
            </div>
        `;

        document.getElementById('clear-route-btn').onclick = () => {
            this.clearRoute();
        };
    }

    /**
     * Clear current route
     */
    clearRoute() {
        this.pathRenderer.clearRoute();
        if (this.dragMarker) {
            this.dragMarker.remove();
            this.dragMarker = null;
        }
        this.hideDirectionsPanel();
    }

    /**
     * Hide directions panel
     */
    hideDirectionsPanel() {
        if (this.directionsPanel) {
            this.directionsPanel.remove();
            this.directionsPanel = null;
        }
        if (this.dragMarker) {
            this.dragMarker.remove();
            this.dragMarker = null;
        }
        this.selectedDestination = null;
        this.map.getCanvas().style.cursor = '';
    }

    /**
     * Update current floor
     */
    updateCurrentFloor(floorId) {
        this.currentFloor = floorId;
    }
}
