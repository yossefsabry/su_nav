import maplibregl from 'maplibre-gl';

// Debug node rendering methods - Part 2: Walkable, Nonwalkable, Kinds, Entrance-aesthetic nodes
export const debugNodesPart2 = {
    addWalkableNodes(geojsonData) {
        const sourceId = 'walkable-nodes-source';
        const layerId = 'walkable-nodes-layer';

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
                    'circle-radius': 2.5,
                    'circle-color': '#00FF00',
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                    'circle-opacity': 0.7
                }
            });
            this.mvfLayerIds.add(layerId);

            this.map.on('click', layerId, (e) => {
                const feature = e.features[0];
                const props = feature.properties;
                const coordinates = feature.geometry.coordinates.slice();

                new maplibregl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`
                        <strong>Type:</strong> Walkable Area<br>
                        <strong>Geometry ID:</strong> ${props.geometryId}<br>
                        <strong>Floor:</strong> ${props.floorId}
                    `)
                    .addTo(this.map);
            });

            this.map.on('mouseenter', layerId, () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });
            this.map.on('mouseleave', layerId, () => {
                this.map.getCanvas().style.cursor = '';
            });
        }
    },

    addNonwalkableNodes(geojsonData) {
        const sourceId = 'nonwalkable-nodes-source';
        const layerId = 'nonwalkable-nodes-layer';

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
                    'circle-radius': 2.5,
                    'circle-color': '#FFA500',
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                    'circle-opacity': 0.7
                }
            });
            this.mvfLayerIds.add(layerId);

            this.map.on('click', layerId, (e) => {
                const feature = e.features[0];
                const props = feature.properties;
                const coordinates = feature.geometry.coordinates.slice();

                new maplibregl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`
                        <strong>Type:</strong> Nonwalkable Area<br>
                        <strong>Geometry ID:</strong> ${props.geometryId}<br>
                        <strong>Floor:</strong> ${props.floorId}
                    `)
                    .addTo(this.map);
            });

            this.map.on('mouseenter', layerId, () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });
            this.map.on('mouseleave', layerId, () => {
                this.map.getCanvas().style.cursor = '';
            });
        }
    },

    addKindsNodes(geojsonData) {
        const sourceId = 'kinds-nodes-source';
        const layerId = 'kinds-nodes-layer';

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
                    'circle-radius': 2.5,
                    'circle-color': [
                        'match',
                        ['get', 'kind'],
                        'wall', '#0000FF',
                        'room', '#9400D3',
                        'object', '#FFD700',
                        '#808080'
                    ],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                    'circle-opacity': 0.7
                }
            });
            this.mvfLayerIds.add(layerId);

            this.map.on('click', layerId, (e) => {
                const feature = e.features[0];
                const props = feature.properties;
                const coordinates = feature.geometry.coordinates.slice();

                new maplibregl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`
                        <strong>Type:</strong> Semantic Classification<br>
                        <strong>Kind:</strong> ${props.kind}<br>
                        <strong>Geometry ID:</strong> ${props.geometryId}<br>
                        <strong>Floor:</strong> ${props.floorId}
                    `)
                    .addTo(this.map);
            });

            this.map.on('mouseenter', layerId, () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });
            this.map.on('mouseleave', layerId, () => {
                this.map.getCanvas().style.cursor = '';
            });
        }
    },

    addEntranceAestheticNodes(geojsonData) {
        const sourceId = 'entrance-aesthetic-nodes-source';
        const layerId = 'entrance-aesthetic-nodes-layer';

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
                    'circle-radius': 4,
                    'circle-color': '#800080',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff',
                    'circle-opacity': 0.8
                }
            });
            this.mvfLayerIds.add(layerId);

            this.map.on('click', layerId, (e) => {
                const feature = e.features[0];
                const props = feature.properties;
                const coordinates = feature.geometry.coordinates.slice();

                new maplibregl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`
                        <strong>Type:</strong> Entrance Aesthetic<br>
                        <strong>Kind:</strong> ${props.kind}<br>
                        <strong>Entrance ID:</strong> ${props.entranceId}<br>
                        <strong>Geometry ID:</strong> ${props.geometryId}<br>
                        <strong>Floor:</strong> ${props.floorId}
                    `)
                    .addTo(this.map);
            });

            this.map.on('mouseenter', layerId, () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });
            this.map.on('mouseleave', layerId, () => {
                this.map.getCanvas().style.cursor = '';
            });
        }
    },

    addLocationMarkers(geojsonData) {
        const sourceId = 'location-markers-source';
        const layerId = 'location-markers-layer';

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
                    'circle-radius': 5,
                    'circle-color': '#FFD700',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff',
                    'circle-opacity': 0.9
                }
            });
            this.mvfLayerIds.add(layerId);

            this.map.on('click', layerId, (e) => {
                const feature = e.features[0];
                const props = feature.properties;
                const coordinates = feature.geometry.coordinates.slice();

                // Dispatch custom event for DirectionsUI to handle
                window.dispatchEvent(new CustomEvent('location-clicked', {
                    detail: {
                        name: props.name,
                        coords: coordinates,
                        floorId: props.floorId,
                        locationId: props.locationId
                    }
                }));
            });

            this.map.on('mouseenter', layerId, () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });
            this.map.on('mouseleave', layerId, () => {
                this.map.getCanvas().style.cursor = '';
            });
        }
    }
};
