import { Map as MapLibreMap, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { starlightTheme } from './theme.js';
import { loadMVFBundle, loadNodes } from './src/mvf-loader.js';
import { LayerManager } from './src/layer-manager.js';
import { UIManager } from './src/ui-manager.js';

import { Pathfinder } from './src/pathfinder.js';
import { InteractionManager } from './src/interaction-manager.js';

async function initApp() {
  // 1. Load Data
  const mvfData = await loadMVFBundle('/assets/my_data.zip');
  const { manifest, styles, locations, floors, entranceIds, entranceGeometryToFloorMap, geometry, connections } = mvfData;

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

    // 6. Load Nodes (Data only, for pathfinding)
    const nodeFeatures = await loadNodes(floors);
    // layerManager.addNodes(nodeFeatures); // Visuals removed

    // 6b. Debug Nodes removed per user request
    /*
    const debugCategories = {
      'walkable': { ids: mvfData.walkableIds, color: '#00FF00' },
      'nonwalkable': { ids: mvfData.nonwalkableIds, color: '#FFA500' },
      'kinds': { ids: mvfData.kindsIds, color: '#0000FF' },
      'entrance-aesthetic': { ids: mvfData.entranceAestheticIds, color: '#800080' },
      'annotations': { ids: mvfData.annotationsIds, color: '#00FFFF' },
      'locations': { ids: mvfData.locationsIds, color: '#FFFF00' },
      'geometry': { ids: mvfData.geometryIds, color: '#808080' }
    };
    layerManager.addDebugNodes(debugCategories, geometry);
    */

    // 7. Setup Pathfinding
    const pathfinder = new Pathfinder();
    pathfinder.load(nodeFeatures, connections);

    // 8. Setup Interaction
    const interactionManager = new InteractionManager(map, pathfinder, layerManager);
    interactionManager.init();

    // 9. Setup UI
    const uiManager = new UIManager(map, layerManager, floors);
    uiManager.init();
  });
}

initApp().catch(console.error);
