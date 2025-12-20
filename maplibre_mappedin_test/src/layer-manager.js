import * as turf from '@turf/turf';
import { getCentroid } from './utils.js';
import maplibregl from 'maplibre-gl';

export class LayerManager {
    constructor(map, themeColors) {
        this.map = map;
        this.themeColors = themeColors;
        this.mvfLayerIds = new Set();
        this.MIN_ZOOM_INDOOR = 19;
    }

    addBuildingShell(floors) {
        if (floors.length > 0) {
            const buildingFootprint = floors[0]; // Ground floor
            const totalHeight = floors.length * 4;

            this.map.addSource('building-shell', {
                type: 'geojson',
                data: buildingFootprint
            });

            this.map.addLayer({
                id: 'building-shell',
                type: 'fill-extrusion',
                source: 'building-shell',
                maxzoom: this.MIN_ZOOM_INDOOR, // Visible ONLY when zoomed out
                paint: {
                    'fill-extrusion-color': this.themeColors.ExteriorWalls,
                    'fill-extrusion-height': totalHeight,
                    'fill-extrusion-base': 0.1, // Raised slightly to prevent z-fighting with ground
                    'fill-extrusion-opacity': 0.9,
                    'fill-extrusion-vertical-gradient': true
                }
            });

            // Interactions
            this.map.on('click', 'building-shell', (e) => {
                this.map.flyTo({
                    center: e.lngLat,
                    zoom: this.MIN_ZOOM_INDOOR + 1,
                    pitch: 60,
                    bearing: -17,
                    essential: true
                });
            });
            this.map.on('mouseenter', 'building-shell', () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });
            this.map.on('mouseleave', 'building-shell', () => {
                this.map.getCanvas().style.cursor = '';
            });
        }
    }

    processStyles(styles, geometry, entranceIds) {
        // Create a lookup for geometryId -> floorId
        const geometryToFloor = new Map();
        Object.values(styles).forEach(style => {
            if (style.geometryAnchors) {
                style.geometryAnchors.forEach(anchor => {
                    geometryToFloor.set(anchor.geometryId, anchor.floorId);
                });
            }
        });

        const layersToAdd = [];

        Object.entries(styles).forEach(([styleName, style]) => {
            const anchors = style.geometryAnchors || [];
            const anchorIds = anchors.map(a => a.geometryId);

            // Filter features for this style, excluding doors
            let filteredFeatures = geometry.features.filter(feature =>
                anchorIds.includes(feature.properties.id) && !entranceIds.has(feature.properties.id)
            ).map(feature => {
                const floorId = geometryToFloor.get(feature.properties.id);
                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        floorId: floorId
                    }
                };
            });

            if (filteredFeatures.length === 0) return;

            layersToAdd.push({ styleName, style, features: filteredFeatures });
        });

        // Sort layers: 2D (fill, line) first, then 3D (fill-extrusion)
        // We determine type based on geometry and style properties roughly as before
        const is3D = (item) => {
            const { styleName, style, features } = item;
            const layerHeight = (style.height || 0) * 3;
            const isLine = features[0].geometry.type === 'LineString' || features[0].geometry.type === 'MultiLineString';
            // Walls are special: lines become 3D extrusions
            if (styleName.includes('Walls') && isLine && layerHeight > 0) return true;
            // Polygons with height are 3D
            const isPolygon = features[0].geometry.type === 'Polygon' || features[0].geometry.type === 'MultiPolygon';
            if (isPolygon && layerHeight > 0) return true;
            return false;
        };

        layersToAdd.sort((a, b) => {
            const a3D = is3D(a);
            const b3D = is3D(b);
            if (a3D === b3D) return 0;
            return a3D ? 1 : -1; // 2D comes first (0), 3D comes last (1)
        });

        // Keep track of the first 3D layer ID for inserting the route later
        this.first3DLayerId = null;

        layersToAdd.forEach(item => {
            this.createStyleLayer(item.styleName, item.style, item.features);
            if (is3D(item) && !this.first3DLayerId) {
                this.first3DLayerId = item.styleName;
            }
        });
    }

    createStyleLayer(styleName, style, features) {
        let isPolygon = features[0].geometry.type === 'Polygon' || features[0].geometry.type === 'MultiPolygon';
        let isLine = features[0].geometry.type === 'LineString' || features[0].geometry.type === 'MultiLineString';
        const isPoint = features[0].geometry.type === 'Point' || features[0].geometry.type === 'MultiPoint';

        // Get layer color with proper priority: theme color > override white > style color > default
        let layerColor;
        if (this.themeColors[styleName]) {
            // Use theme color if available
            layerColor = this.themeColors[styleName];
        } else if (style.color) {
            // Check if style color is white/light and override it
            const lightColors = ['#ffffff', '#FFFFFF', '#fcfcfc', '#f5f5f5', '#E6F4FB', '#DCDCDC', '#F5EFE0'];
            if (lightColors.some(c => c.toLowerCase() === style.color.toLowerCase())) {
                layerColor = '#2A2D35'; // Dark gray instead of white
            } else {
                layerColor = style.color;
            }
        } else {
            layerColor = this.themeColors.Default;
        }

        // Use different height multipliers: walls stay lower, rooms/other shapes taller
        let heightMultiplier;
        if (styleName.includes('Walls')) {
            heightMultiplier = 1.0; // Keep walls at normal height
        } else {
            heightMultiplier = 1.8; // Make rooms and other shapes taller
        }
        const layerHeight = (style.height || 0) * heightMultiplier;

        // Buffer lines to polygons for walls
        if (styleName.includes('Walls') && isLine && layerHeight > 0) {
            features = features.map(feature => {
                try {
                    const buffered = turf.buffer(feature, 0.15, { units: 'meters' });
                    buffered.properties = feature.properties;
                    return buffered;
                } catch (e) {
                    return feature;
                }
            });
            isPolygon = true;
            isLine = false;
        }

        this.map.addSource(styleName, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: features },
        });

        const layerMinZoom = styleName === 'ExteriorWalls' ? 15 : this.MIN_ZOOM_INDOOR;
        const isWall = styleName.includes('Walls');
        const layerOpacity = isWall ? 1.0 : (style.opacity || 1);

        if (isPolygon) {
            if (layerHeight > 0) {
                this.map.addLayer({
                    id: styleName,
                    type: 'fill-extrusion',
                    source: styleName,
                    minzoom: layerMinZoom,
                    paint: {
                        'fill-extrusion-color': layerColor,
                        'fill-extrusion-height': layerHeight,
                        'fill-extrusion-base': 0,
                        'fill-extrusion-opacity': layerOpacity,
                        'fill-extrusion-vertical-gradient': true
                    }
                });
                this.mvfLayerIds.add(styleName);
            } else {
            }
            // Outline removed

        } else if (isLine) {
            // ...
        }
    }

    addDoors(geometry, entranceIds, entranceGeometryToFloorMap) {
        // ... (filtering logic same as before)
        let doorFeatures = geometry.features
            .filter(feature => entranceIds.has(feature.properties.id))
            .map(feature => {
                const floorId = entranceGeometryToFloorMap.get(feature.properties.id);
                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        floorId: floorId
                    }
                };
            });

        doorFeatures = doorFeatures.map(feature => {
            if (feature.geometry.type === 'LineString') {
                try {
                    const buffered = turf.buffer(feature, 0.05, { units: 'meters' });
                    buffered.properties = feature.properties;
                    return buffered;
                } catch (e) {
                    return feature;
                }
            }
            return feature;
        });

        if (doorFeatures.length > 0) {
            this.map.addSource('doors', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: doorFeatures }
            });

            this.map.addLayer({
                id: 'doors',
                type: 'fill-extrusion',
                source: 'doors',
                minzoom: this.MIN_ZOOM_INDOOR,
                paint: {
                    'fill-extrusion-color': this.themeColors['Doors'],
                    'fill-extrusion-height': 0.6, // Smaller than walls (0.8)
                    'fill-extrusion-base': 0,
                    'fill-extrusion-opacity': 0.4,
                    'fill-extrusion-vertical-gradient': true
                }
            });
            this.mvfLayerIds.add('doors');
        }
    }

    addLabels(locations, geometry) {
        const labelFeatures = [];
        locations.forEach(loc => {
            if (loc.details && loc.details.name && loc.geometryAnchors && loc.geometryAnchors.length > 0) {
                const geoId = loc.geometryAnchors[0].geometryId;
                const floorId = loc.geometryAnchors[0].floorId;
                const feature = geometry.features.find(f => f.properties.id === geoId);
                if (feature) {
                    const centroid = getCentroid(feature.geometry);
                    if (centroid) {
                        labelFeatures.push({
                            type: 'Feature',
                            geometry: { type: 'Point', coordinates: centroid },
                            properties: {
                                name: loc.details.name,
                                floorId: floorId
                            }
                        });
                    }
                }
            }
        });

        if (labelFeatures.length > 0) {
            this.map.addSource('labels', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: labelFeatures }
            });
            this.map.addLayer({
                id: 'labels',
                type: 'symbol',
                source: 'labels',
                minzoom: this.MIN_ZOOM_INDOOR,
                layout: {
                    'text-field': ['get', 'name'],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 12,
                    'text-anchor': 'center',
                    'text-offset': [0, 0]
                },
                paint: {
                    'text-color': '#ffffff',
                    'text-halo-color': '#000000',
                    'text-halo-width': 1
                }
            });
            this.mvfLayerIds.add('labels');
        }
    }

    addNodes(nodeFeatures) {
        // Nodes are for pathfinding logic only, not visualization.
        // Visual debugging removed as per user request.
    }

    addDebugNodes(categories, geometry) {
        // Categories is an object: { 'name': { ids: Set, color: string } }

        Object.entries(categories).forEach(([name, data]) => {
            const debugFeatures = [];
            const { ids, color } = data;

            geometry.features.forEach(feature => {
                if (ids.has(feature.properties.id)) {
                    const centroid = getCentroid(feature.geometry);
                    if (centroid) {
                        debugFeatures.push({
                            type: 'Feature',
                            geometry: { type: 'Point', coordinates: centroid },
                            properties: {
                                id: feature.properties.id,
                                floorId: feature.properties.floorId
                            }
                        });
                    }
                }
            });

            if (debugFeatures.length > 0) {
                const sourceId = `debug-${name}-source`;
                const layerId = `debug-${name}-layer`;

                if (this.map.getSource(sourceId)) {
                    this.map.getSource(sourceId).setData({
                        type: 'FeatureCollection',
                        features: debugFeatures
                    });
                } else {
                    this.map.addSource(sourceId, {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: debugFeatures
                        }
                    });

                    this.map.addLayer({
                        id: layerId,
                        type: 'circle',
                        source: sourceId,
                        minzoom: this.MIN_ZOOM_INDOOR,
                        paint: {
                            'circle-radius': 3,
                            'circle-color': color,
                            'circle-stroke-width': 1,
                            'circle-stroke-color': '#ffffff',
                            'circle-opacity': 0.8
                        }
                    });
                    this.mvfLayerIds.add(layerId);

                    // Add click listener for popup
                    this.map.on('click', layerId, (e) => {
                        const feature = e.features[0];
                        const props = feature.properties;
                        const coordinates = feature.geometry.coordinates.slice();

                        new maplibregl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(`
                                <strong>Category:</strong> ${name}<br>
                                <strong>ID:</strong> ${props.id}<br>
                                <strong>Floor:</strong> ${props.floorId}
                            `)
                            .addTo(this.map);
                    });

                    // Change cursor on hover
                    this.map.on('mouseenter', layerId, () => {
                        this.map.getCanvas().style.cursor = 'pointer';
                    });
                    this.map.on('mouseleave', layerId, () => {
                        this.map.getCanvas().style.cursor = '';
                    });
                }
            }
        });
    }

    updateFloorVisibility(currentFloorId) {
        this.currentFloorId = currentFloorId;
        this.mvfLayerIds.forEach(layerId => {
            if (this.map.getLayer(layerId)) {
                if (layerId === 'building-shell') return;
                this.map.setFilter(layerId, ['==', ['get', 'floorId'], currentFloorId]);
            }
        });
    }

    updateMultiFloorVisibility(visibleFloorIds) {
        this.currentFloorId = Array.from(visibleFloorIds)[0]; // Set first visible as current
        this.mvfLayerIds.forEach(layerId => {
            if (this.map.getLayer(layerId)) {
                if (layerId === 'building-shell') return;
                // Show layer if its floorId is in the visible set
                this.map.setFilter(layerId, ['in', ['get', 'floorId'], ['literal', Array.from(visibleFloorIds)]]);
            }
        });
    }

    addWallNodes(geojsonData) {
        const sourceId = 'wall-nodes-source';
        const layerId = 'wall-nodes-layer';

        if (this.map.getSource(sourceId)) {
            this.map.getSource(sourceId).setData(geojsonData);
        } else {
            this.map.addSource(sourceId, {
                type: 'geojson',
                data: geojsonData
            });

            this.map.addLayer({
                id: layerId,
                type: 'circle',
                source: sourceId,
                minzoom: this.MIN_ZOOM_INDOOR,
                paint: {
                    'circle-radius': 3,
                    'circle-color': '#FF0000', // Red for walls/obstacles
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                    'circle-opacity': 0.8
                }
            });
            this.mvfLayerIds.add(layerId);

            // Add click listener for popup
            this.map.on('click', layerId, (e) => {
                const feature = e.features[0];
                const props = feature.properties;
                const coordinates = feature.geometry.coordinates.slice();

                new maplibregl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`
                        <strong>Type:</strong> Wall Node<br>
                        <strong>Original ID:</strong> ${props.originalId}<br>
                        <strong>Floor:</strong> ${props.floorId}
                    `)
                    .addTo(this.map);
            });

            // Change cursor on hover
            this.map.on('mouseenter', layerId, () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });
            this.map.on('mouseleave', layerId, () => {
                this.map.getCanvas().style.cursor = '';
            });
        }
    }
}
