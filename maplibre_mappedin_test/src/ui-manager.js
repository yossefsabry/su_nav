export class UIManager {
    constructor(map, layerManager, floors) {
        this.map = map;
        this.layerManager = layerManager;
        this.floors = floors;
        this.currentFloorId = floors[0]?.properties.id;
        this.MIN_ZOOM_INDOOR = 19;
    }

    init() {
        this.createFloorControls();
        this.setupZoomListener();
        // Initial update
        this.layerManager.updateFloorVisibility(this.currentFloorId);
    }

    createFloorControls() {
        const container = document.getElementById('floor-controls');
        container.innerHTML = '';

        // Track which floors are visible (start with first floor visible)
        // this.visibleFloors = new Set([this.currentFloorId]);

        this.floors.forEach(floor => {
            const btn = document.createElement('button');
            btn.innerText = floor.properties.details.name || `Level ${floor.properties.elevation}`;

            if (floor.properties.id === this.currentFloorId) {
                btn.classList.add('active');
            }

            btn.onclick = () => {
                const floorId = floor.properties.id;

                // Enforce single floor selection
                if (this.currentFloorId !== floorId) {
                    this.currentFloorId = floorId;

                    // Update button states
                    const buttons = container.getElementsByTagName('button');
                    Array.from(buttons).forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Update map visibility
                    this.layerManager.updateFloorVisibility(this.currentFloorId);
                }
            };

            container.insertBefore(btn, container.firstChild);
        });
    }

    setupZoomListener() {
        const floorControlsDiv = document.getElementById('floor-controls');

        const checkZoom = () => {
            const zoom = this.map.getZoom();
            if (zoom < this.MIN_ZOOM_INDOOR) {
                floorControlsDiv.style.display = 'none';
            } else {
                floorControlsDiv.style.display = 'block';
            }
        };

        this.map.on('zoom', checkZoom);
        checkZoom();
    }
}
