import { Map as MapLibreMap, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { starlightTheme } from './theme.js';
import { loadMVFBundle, loadNodes } from './src/mvf-loader.js';
import { LayerManager } from './src/layer-manager.js';
import { UIManager } from './src/ui-manager.js';
import { LegendToggleManager } from './src/legend-toggle-manager.js';

// Pathfinding System
import { PathfindingEngine } from './src/pathfinding/PathfindingEngine.js';
import { PathSmoother } from './src/pathfinding/features/PathSmoother.js';
import { PathRenderer } from './src/pathfinding/visualization/PathRenderer.js';
import { DirectionsUI } from './src/pathfinding/visualization/DirectionsUI.js';

import { Pathfinder } from './src/pathfinder.js';
import { InteractionManager } from './src/interaction-manager.js';


async function initApp() {
  // 1. Load Data
  const mvfData = await loadMVFBundle('/assets/my_data.zip');
  const { manifest, styles, locations, floors, entranceIds, entranceGeometryToFloorMap, geometry, connections } = mvfData;

  // AUGMENT SEARCH INDEX: Scan all geometry for names (e.g. "Room 1000") that might be missing from locations.json
  const existingNames = new Set(locations.map(l => l.details?.name));

  if (geometry && geometry.features) {
    geometry.features.forEach(feature => {
      const props = feature.properties;
      if (props && props.name && !existingNames.has(props.name)) {
        // Create a synthetic location object
        locations.push({
          details: { name: props.name },
          geometryAnchors: [{
            geometryId: props.id,
            floorId: props.floorId
          }]
        });
        existingNames.add(props.name); // Prevent duplicates from multiple geometry parts
      }
    });
  }

  // 2. Initialize Map
  const center = manifest.features?.[0]?.geometry?.coordinates || [0, 0];
  const themeColors = starlightTheme.colors;

  const map = new MapLibreMap({
    container: 'map',
    style: starlightTheme.mapStyle,
    center: center,
    zoom: 19,
    pitch: 60,
    bearing: -17,
    minZoom: 15,
    maxPitch: 85,
    antialias: true // Important for smooth edges
  });

  map.addControl(new NavigationControl(), 'top-right');

  // 3. Customize Basemap to match theme.js colors
  map.on('style.load', () => {
    const layers = map.getStyle().layers;
    layers.forEach(layer => {
      if (layer.type === 'background') {
        map.setPaintProperty(layer.id, 'background-color', themeColors.background);
      }
      if (layer.id.includes('water') && layer.type === 'fill') {
        map.setPaintProperty(layer.id, 'fill-color', themeColors.Restrooms);
      }
      if (layer.id.includes('road') || layer.id.includes('transportation')) {
        if (layer.type === 'line') {
          // Major roads: orange
          if (layer.id.includes('major') || layer.id.includes('primary') || layer.id.includes('trunk') || layer.id.includes('motorway')) {
            map.setPaintProperty(layer.id, 'line-color', '#D97706');
            map.setPaintProperty(layer.id, 'line-opacity', 0.8);
          }
          // Minor roads: dark gray
          else {
            map.setPaintProperty(layer.id, 'line-color', '#2A2D35');
            map.setPaintProperty(layer.id, 'line-opacity', 0.6);
          }
        }
      }
      if (layer.id.includes('building')) {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      }
    });
  });

  map.on('load', async () => {
    // 4. Setup Managers
    const layerManager = new LayerManager(map, themeColors);

    // 5. Render Layers
    layerManager.addBuildingShell(floors);
    layerManager.processStyles(styles, geometry, entranceIds);
    layerManager.addDoors(geometry, entranceIds, entranceGeometryToFloorMap);
    layerManager.addLabels(locations, geometry);

    // 5a. Load and display building address
    try {
      const response = await fetch('/temp_mvf/address.json');
      if (response.ok) {
        const addressData = await response.json();
        const addressDisplay = document.getElementById('building-address');
        if (addressDisplay && addressData.primary?.display?.displayAddress) {
          addressDisplay.textContent = addressData.primary.display.displayAddress;
        }
      }
    } catch (e) {
      console.warn('Failed to load building address:', e);
    }

    // 6. Load Nodes (Data only, for pathfinding)
    const nodeFeatures = await loadNodes(floors);
    // layerManager.addNodes(nodeFeatures); // Visuals removed

    // 6b. Load and display Wall Nodes (from temp_mvf processing)
    try {
      const response = await fetch('/assets/wall_nodes.geojson');
      if (response.ok) {
        const wallNodesData = await response.json();
        layerManager.addWallNodes(wallNodesData);
      } else {
        console.warn('Failed to load wall_nodes.geojson');
      }
    } catch (e) {
      console.error('Error loading wall nodes:', e);
    }

    // 6c. Load and display Stairs Nodes
    try {
      const response = await fetch('/assets/stairs_nodes.geojson');
      if (response.ok) {
        const stairsNodesData = await response.json();
        layerManager.addStairsNodes(stairsNodesData);
      } else {
        console.warn('Failed to load stairs_nodes.geojson');
      }
    } catch (e) {
      console.error('Error loading stairs nodes:', e);
    }

    // 6d. Load and display Elevator Nodes
    try {
      const response = await fetch('/assets/elevator_nodes.geojson');
      if (response.ok) {
        const elevatorNodesData = await response.json();
        layerManager.addElevatorNodes(elevatorNodesData);
      } else {
        console.warn('Failed to load elevator_nodes.geojson');
      }
    } catch (e) {
      console.error('Error loading elevator nodes:', e);
    }

    // 6e. Load and display Annotation Nodes (Entrances with SVG icons)
    try {
      const response = await fetch('/assets/annotation_nodes.geojson');
      if (response.ok) {
        const annotationNodesData = await response.json();
        await layerManager.addAnnotationNodes(annotationNodesData);
      } else {
        console.warn('Failed to load annotation_nodes.geojson');
      }
    } catch (e) {
      console.error('Error loading annotation nodes:', e);
    }


    // 6f. Load and display Walkable Nodes
    try {
      const response = await fetch('/assets/walkable_nodes.geojson');
      if (response.ok) {
        const walkableNodesData = await response.json();
        layerManager.addWalkableNodes(walkableNodesData);
      } else {
        console.warn('Failed to load walkable_nodes.geojson');
      }
    } catch (e) {
      console.error('Error loading walkable nodes:', e);
    }

    // 6g. Load and display Nonwalkable Nodes
    try {
      const response = await fetch('/assets/nonwalkable_nodes.geojson');
      if (response.ok) {
        const nonwalkableNodesData = await response.json();
        layerManager.addNonwalkableNodes(nonwalkableNodesData);
      } else {
        console.warn('Failed to load nonwalkable_nodes.geojson');
      }
    } catch (e) {
      console.error('Error loading nonwalkable nodes:', e);
    }

    // 6h. Load and display Kinds Nodes
    try {
      const response = await fetch('/assets/kinds_nodes.geojson');
      if (response.ok) {
        const kindsNodesData = await response.json();
        layerManager.addKindsNodes(kindsNodesData);
      } else {
        console.warn('Failed to load kinds_nodes.geojson');
      }
    } catch (e) {
      console.error('Error loading kinds nodes:', e);
    }

    // 6i. Load and display Entrance-Aesthetic Nodes
    let entranceAestheticNodesData = null;
    try {
      const response = await fetch('/assets/entrance_aesthetic_nodes.geojson');
      if (response.ok) {
        entranceAestheticNodesData = await response.json();
        layerManager.addEntranceAestheticNodes(entranceAestheticNodesData);
      } else {
        console.warn('Failed to load entrance_aesthetic_nodes.geojson');
      }
    } catch (e) {
      console.error('Error loading entrance-aesthetic nodes:', e);
    }


    // 6j. Load and display Location Markers
    try {
      const response = await fetch('/assets/location_markers.geojson');
      if (response.ok) {
        const locationMarkersData = await response.json();
        layerManager.addLocationMarkers(locationMarkersData);
      } else {
        console.warn('Failed to load location_markers.geojson');
      }
    } catch (e) {
      console.error('Error loading location markers:', e);
    }


    // 7. Initialize Pathfinding System
    console.log('🚀 Initializing Advanced Pathfinding System...');

    const pathfindingEngine = new PathfindingEngine();
    const pathSmoother = new PathSmoother();
    const pathRenderer = new PathRenderer(map, layerManager);

    try {
      // Load walkable/nonwalkable data for collision detection
      const walkableIds = new Set();
      const nonwalkableIds = new Set();
      const kindsData = {};

      // Load walkable data
      try {
        const walkableResponse = await fetch('/assets/walkable_nodes.geojson');
        if (walkableResponse.ok) {
          const walkableData = await walkableResponse.json();
          walkableData.features.forEach(f => {
            if (f.properties.geometryIds) {
              f.properties.geometryIds.forEach(id => walkableIds.add(id));
            }
          });
        }
      } catch (e) {
        console.warn('Could not load walkable data:', e);
      }

      // Load nonwalkable data
      try {
        const nonwalkableResponse = await fetch('/assets/nonwalkable_nodes.geojson');
        if (nonwalkableResponse.ok) {
          const nonwalkableData = await nonwalkableResponse.json();
          nonwalkableData.features.forEach(f => {
            if (f.properties.geometryIds) {
              f.properties.geometryIds.forEach(id => nonwalkableIds.add(id));
            }
          });
        }
      } catch (e) {
        console.warn('Could not load nonwalkable data:', e);
      }

      // Load kinds data (walls)
      try {
        const kindsResponse = await fetch('/assets/kinds_nodes.geojson');
        if (kindsResponse.ok) {
          const kindsGeoData = await kindsResponse.json();
          kindsGeoData.features.forEach(f => {
            if (f.properties.kind && f.properties.geometryIds) {
              f.properties.geometryIds.forEach(id => {
                kindsData[id] = f.properties.kind;
              });
            }
          });
        }
      } catch (e) {
        console.warn('Could not load kinds data:', e);
      }

      // Initialize pathfinding engine
      await pathfindingEngine.initialize(
        nodeFeatures,
        geometry,
        connections,
        walkableIds,
        nonwalkableIds,
        kindsData,
        entranceAestheticNodesData // Pass entrance nodes to pathfinding engine
      );

      console.log('✅ Pathfinding System Ready!');

      // Initialize DirectionsUI
      const directionsUI = new DirectionsUI(map, pathfindingEngine, pathRenderer);

      // Fix: Ensure we use the correct floor property
      // floors[0] is a GeoJSON feature, so we need floors[0].properties.id
      const initialFloorId = floors[0].properties ? floors[0].properties.id : floors[0].id;

      directionsUI.initialize(initialFloorId); // Start with first floor

      // Update current floor when floor changes
      window.addEventListener('floor-changed', (e) => {
        directionsUI.updateCurrentFloor(e.detail.floorId);
      });

    } catch (error) {
      console.error('Failed to initialize pathfinding:', error);
    }


    // 6b. Debug Nodes removed per user request (User: "Delete all debug nodes")

    // 7. Setup Pathfinding
    const pathfinder = new Pathfinder();
    pathfinder.load(nodeFeatures, connections);

    // EXPOSE FOR DEBUGGING
    window.pathfindingEngine = pathfindingEngine;

    // Run Verification Suite
    import('./src/pathfinding/verification_script.js').then(({ runVerification }) => {
      // Run after a short delay to ensure everything is settled
      setTimeout(() => runVerification(pathfindingEngine), 2000);
    });

    // 8. Setup Interaction
    const interactionManager = new InteractionManager(map, pathfinder, layerManager);
    interactionManager.init();

    // 9. Setup UI
    const uiManager = new UIManager(map, layerManager, floors);
    uiManager.init();

    // 9b. Setup Search Bar
    import('./src/ui/SearchBox.js').then(({ SearchBox }) => {
      const searchBox = new SearchBox(map, layerManager, locations);
      searchBox.init();
    });

    // 10. Setup Legend Toggle (with localStorage persistence)
    const legendToggleManager = new LegendToggleManager(layerManager);
    legendToggleManager.init();
  });
}

initApp().catch(console.error);
