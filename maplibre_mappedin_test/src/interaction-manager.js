import { Marker, Popup } from 'maplibre-gl';
import * as turf from '@turf/turf';

export class InteractionManager {
    constructor(map, pathfinder, layerManager) {
        this.map = map;
        this.pathfinder = pathfinder;
        this.layerManager = layerManager;

        this.startNode = null;
        this.endNode = null;

        this.startMarker = null;
        this.endMarker = null;

        this.isSelectingStart = false;
    }

    init() {
        this.map.on('click', (e) => this.handleMapClick(e));
    }

    handleMapClick(e) {
        // Check if we clicked a feature (Room/POI)
        const features = this.map.queryRenderedFeatures(e.point);

        // Filter for our MVF layers (excluding building shell if we are inside)
        const relevantFeatures = features.filter(f =>
            f.layer.id !== 'building-shell' &&
            f.layer.id !== 'nodes-layer' &&
            this.layerManager.mvfLayerIds.has(f.layer.id.replace('-outline', ''))
        );

        if (this.isSelectingStart) {
            // User is dropping a pin for "Start"
            this.setStartLocation(e.lngLat);
            this.isSelectingStart = false;
            return;
        }

        if (relevantFeatures.length > 0) {
            const feature = relevantFeatures[0];
            const geometryId = feature.properties.id;

            console.log('Clicked feature:', geometryId, feature.properties);

            // Try to find a node associated with this geometry
            const node = this.pathfinder.getNodeByGeometryId(geometryId);

            if (node) {
                this.setDestination(node, feature.properties.name || "Selected Location");
            } else {
                console.log('No node found for this feature. Finding nearest node...');
                // Fallback: Find nearest node on the same floor
                const floorId = feature.properties.floorId;
                if (floorId) {
                    // Use centroid of feature to find nearest node
                    // Simplified: use click point
                    const nearest = this.pathfinder.findNearestNode(e.lngLat, floorId);
                    if (nearest) {
                        this.setDestination(nearest, feature.properties.name || "Selected Location");
                    }
                }
            }
        }
    }

    setDestination(node, name) {
        this.endNode = node;

        // Remove existing end marker
        if (this.endMarker) this.endMarker.remove();

        // Create new end marker element
        const el = document.createElement('div');
        el.className = 'marker-destination';
        el.innerHTML = `
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3));">
        <path d="M16 0C7.16344 0 0 7.16344 0 16C0 26.5 16 42 16 42C16 42 32 26.5 32 16C32 7.16344 24.8366 0 16 0ZM16 22C12.6863 22 10 19.3137 10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22Z" fill="#FF4B4B"/>
        <circle cx="16" cy="16" r="4" fill="white"/>
      </svg>
    `;
        el.style.width = '32px';
        el.style.height = '42px';
        el.style.cursor = 'pointer';
        // Offset to align the tip of the pin with the coordinate

        this.endMarker = new Marker({ element: el, offset: [0, -21] })
            .setLngLat(node.coords)
            .setPopup(new Popup({ offset: 25 }).setText(name))
            .addTo(this.map)
            .togglePopup();

        console.log(`Destination set to ${name} (${node.id})`);

        // Prompt for Start
        this.showToast(`Destination set to ${name}.<br>Click anywhere to set Start.`);
        this.isSelectingStart = true;
    }

    showToast(message) {
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.style.position = 'absolute';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            toast.style.color = 'white';
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '5px';
            toast.style.zIndex = '1000';
            toast.style.fontFamily = 'sans-serif';
            toast.style.pointerEvents = 'none';
            document.body.appendChild(toast);
        }
        toast.innerHTML = message;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 5000);
    }

    setStartLocation(lngLat) {
        // Find nearest node to this location
        let nearest = null;
        let minDist = Infinity;
        const point = turf.point([lngLat.lng, lngLat.lat]);

        this.pathfinder.nodes.forEach(node => {
            const dist = turf.distance(point, turf.point(node.coords));
            if (dist < minDist) {
                minDist = dist;
                nearest = node;
            }
        });

        if (nearest) {
            this.startNode = nearest;

            if (this.startMarker) this.startMarker.remove();

            const el = document.createElement('div');
            el.className = 'marker-start';
            el.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3));">
          <circle cx="20" cy="20" r="18" fill="#4CAF50" stroke="white" stroke-width="3"/>
          <path d="M20 10C17.79 10 16 11.79 16 14C16 16.21 17.79 18 20 18C22.21 18 24 16.21 24 14C24 11.79 22.21 10 20 10ZM20 20C17.33 20 12 21.34 12 24V26H28V24C28 21.34 22.67 20 20 20Z" fill="white"/>
        </svg>
      `;
            el.style.width = '40px';
            el.style.height = '40px';
            el.style.cursor = 'grab';

            this.startMarker = new Marker({
                element: el,
                draggable: true,
                offset: [0, 0] // Center alignment for the puck
            })
                .setLngLat(nearest.coords)
                .addTo(this.map);

            this.startMarker.on('dragend', () => {
                const lngLat = this.startMarker.getLngLat();
                this.setStartLocation(lngLat);
            });

            console.log(`Start set to ${nearest.id}`);

            this.calculateAndDrawPath();
        }
    }

    calculateAndDrawPath() {
        if (!this.startNode || !this.endNode) return;

        const path = this.pathfinder.findPath(this.startNode.id, this.endNode.id);

        if (path) {
            console.log('Path found:', path.length, 'steps');
            this.drawPath(path);
        } else {
            alert('No path found!');
        }
    }

    drawPath(path) {
        // Filter path for current floor
        const currentFloorId = this.layerManager.currentFloorId;

        if (!currentFloorId) {
            // If no floor selected (e.g. overview), maybe show full path or nothing?
            // For now, show full path if no floor filtering is active (though usually there is one).
            this.renderPathGeoJSON(path.map(n => n.coords));
            return;
        }

        // We need to create LineStrings for contiguous segments on the current floor.
        const segments = [];
        let currentSegment = [];

        for (let i = 0; i < path.length; i++) {
            const node = path[i];
            if (node.floorId === currentFloorId) {
                currentSegment.push(node.coords);
            } else {
                if (currentSegment.length > 0) {
                    // If we just left the floor, we might want to include the connection point?
                    // Or just end the segment.
                    // If the previous node was on the floor, we keep it.
                    segments.push(currentSegment);
                    currentSegment = [];
                }
            }
        }
        if (currentSegment.length > 0) {
            segments.push(currentSegment);
        }

        // Merge segments into a MultiLineString
        const geometry = {
            type: 'MultiLineString',
            coordinates: segments
        };

        this.updateRouteSource(geometry);
    }

    renderPathGeoJSON(coordinates) {
        this.updateRouteSource({
            type: 'LineString',
            coordinates: coordinates
        });
    }

    updateRouteSource(geometry) {
        const geojson = {
            type: 'Feature',
            properties: {},
            geometry: geometry
        };

        if (this.map.getSource('route')) {
            this.map.getSource('route').setData(geojson);
        } else {
            this.map.addSource('route', {
                type: 'geojson',
                data: geojson
            });

            // Insert before the first 3D layer if available, otherwise on top
            const beforeLayerId = this.layerManager.first3DLayerId || 'labels';

            this.map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3b9ddd',
                    'line-width': 5,
                    'line-opacity': 0.8
                }
            }, beforeLayerId);
        }
    }
}
