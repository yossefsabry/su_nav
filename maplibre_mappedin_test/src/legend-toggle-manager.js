// Legend Toggle Manager - Handles interactive legend with localStorage persistence

const STORAGE_KEY = 'mappedin_layer_visibility';

export class LegendToggleManager {
    constructor(layerManager) {
        this.layerManager = layerManager;
        this.layerStates = this.loadLayerStates();
    }

    init() {
        // Get all toggleable legend items
        const toggleableItems = document.querySelectorAll('.legend-item.toggleable');

        toggleableItems.forEach(item => {
            const layerId = item.dataset.layer;

            // Apply saved state
            const isVisible = this.layerStates[layerId] !== false; // Default to true
            this.updateLegendItem(item, isVisible);
            this.layerManager.setLayerVisibility(layerId, isVisible);

            // Add click listener
            item.addEventListener('click', () => {
                this.toggleLayer(layerId, item);
            });
        });
    }

    toggleLayer(layerId, legendItem) {
        // Toggle the layer visibility
        const isVisible = this.layerManager.toggleLayerVisibility(layerId);

        // Update legend item visual state
        this.updateLegendItem(legendItem, isVisible);

        // Save to localStorage
        this.layerStates[layerId] = isVisible;
        this.saveLayerStates();
    }

    updateLegendItem(item, isVisible) {
        if (isVisible) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    }

    loadLayerStates() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.warn('Failed to load layer states from localStorage:', e);
            return {};
        }
    }

    saveLayerStates() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.layerStates));
        } catch (e) {
            console.warn('Failed to save layer states to localStorage:', e);
        }
    }

    // Get current state of a layer
    getLayerState(layerId) {
        return this.layerStates[layerId] !== false;
    }

    // Set state of a layer programmatically
    setLayerState(layerId, isVisible) {
        const legendItem = document.querySelector(`.legend-item[data-layer="${layerId}"]`);
        if (legendItem) {
            this.layerManager.setLayerVisibility(layerId, isVisible);
            this.updateLegendItem(legendItem, isVisible);
            this.layerStates[layerId] = isVisible;
            this.saveLayerStates();
        }
    }

    // Reset all layers to visible
    resetAll() {
        const toggleableItems = document.querySelectorAll('.legend-item.toggleable');
        toggleableItems.forEach(item => {
            const layerId = item.dataset.layer;
            this.setLayerState(layerId, true);
        });
    }
}
