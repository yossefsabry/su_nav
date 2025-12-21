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
        this.setupExternalListeners();
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

    setupExternalListeners() {
        window.addEventListener('floor-changed', (e) => {
            const newFloorId = e.detail.floorId;
            if (newFloorId && newFloorId !== this.currentFloorId) {
                this.currentFloorId = newFloorId;

                // Update UI Buttons
                const container = document.getElementById('floor-controls');
                const buttons = container.getElementsByTagName('button');
                Array.from(buttons).forEach(btn => {
                    // Logic to match button to floor.
                    // We need to re-find the button or re-render.
                    // Easiest is to check text or store ID on button.
                    // Let's iterate floors to find index or ID.
                });

                // Better: Re-render controls or just find the one with correct index/ID?
                // Given createFloorControls logic above didn't store IDs on buttons explicitly,
                // let's just re-trigger the click logic or update classes manually.

                // Refactoring createFloorControls to assign IDs to buttons would be cleaner,
                // but for now let's just iterate and match.

                // Refresh controls entirely to be safe and simple
                this.createFloorControls();

                // Update map
                this.layerManager.updateFloorVisibility(this.currentFloorId);
            }
        });
    }
}
