# Map Component - Clean Rebuild

## What Was Fixed

The map component has been completely rebuilt from scratch with a focus on:

### ✅ 1. Distance-Based Marker Visibility
- **Smart Filtering**: Markers are now filtered based on distance from user location
- **Dynamic Range**: Visible range adjusts automatically based on zoom level
  - Close zoom: ~100m radius
  - Medium zoom: ~500m radius
  - Far zoom: ~5km radius
- **Performance**: Only renders markers that are actually visible

### ✅ 2. Improved User Location Marker
- **Stationary Mode**: Clean blue dot with white border and accuracy circle
- **Moving Mode**: Blue navigation arrow icon (when speed > 0.5 m/s)
- **Rotation**: Arrow rotates based on device heading/direction
- **Smooth**: Uses native map rotation for smooth turning

### ✅ 3. Simplified Route Calculation
- **A* Pathfinding**: Proper pathfinding algorithm that finds optimal route
- **Direct Paths**: For destinations < 20m away, shows direct line
- **Performance**: Limited to 200 iterations to prevent hanging
- **Neighbor Distance**: Uses 50m radius for finding nearby waypoints

### ✅ 4. Clean UI
- **No Clutter**: Removed complex clustering in favor of simple distance filtering
- **Clear Information**: Distance and ETA clearly displayed
- **Smooth Animations**: Map smoothly animates between views
- **Debug Info** (Dev Mode): Shows visible markers count and range

## Key Features

### Distance Display
- Shows in bottom sheet when point is selected
- Format: "XXX m • X min walk"
- Walking speed: 1.4 m/s (average human walking speed)

### User Location
- Blue dot when stationary
- Blue arrow icon when moving (speed > 0.5 m/s)
- Accuracy circle shows GPS accuracy
- Auto-centers on first location

### Navigation
- Click marker → Shows route and distance
- Click "Start" → Activates navigation mode
- Navigation bar shows: Distance | ETA
- Route shown as dotted blue line

### Zoom Behavior
- Zooms to show both user and destination
- Auto-adjusts padding to keep both visible
- Navigation mode: Focuses on user location

## Debug Information

In development mode (`__DEV__`), you'll see:
```
Visible: 12/150 points
Range: 456m
```

This shows:
- How many markers are currently visible
- Out of total markers available
- Current visible range in meters

## Performance Optimizations

1. **useMemo** for location point filtering
2. **tracksViewChanges={false}** on markers (prevents unnecessary re-renders)
3. Dynamic visibility based on distance
4. Limited pathfinding iterations
5. Debounced region changes

## How It Works

### Marker Visibility Algorithm
```
1. Get current map region
2. Calculate visible distance from latitudeDelta
3. Filter all points by distance from user/center
4. Only render filtered points
```

### Route Calculation
```
1. Find nearest point to user
2. Run A* pathfinding to destination
3. Use 50m neighbor radius
4. Return optimal path or direct line
```

### User Location Updates
```
1. GPS updates every 1 second or 1 meter
2. Check if user is moving (speed > 0.5 m/s)
3. Show appropriate marker (dot/arrow)
4. Rotate based on heading
```

## Testing Checklist

- [ ] Markers appear based on zoom level
- [ ] User location shows as blue dot
- [ ] User location shows arrow when moving
- [ ] Route calculation works for nearby points
- [ ] Route calculation works for far points
- [ ] Distance is displayed correctly
- [ ] Navigation mode works
- [ ] Map centers on user location
- [ ] Search opens modal
- [ ] Camera opens camera view

## Known Limitations

1. **Route Quality**: A* pathfinding is simplified - may not follow exact building paths
2. **Marker Density**: If too many points in small area, they may overlap
3. **GPS Accuracy**: Indoor GPS can be unreliable (5-50m accuracy)
4. **Performance**: With 500+ markers, may need additional optimization

## Future Improvements

1. Add marker clustering for very zoomed out views
2. Implement building-aware pathfinding
3. Add floor selection for multi-story buildings
4. Cache calculated routes
5. Add offline map support
6. Add compass heading indicator

## Configuration

You can adjust these values in `map-view.tsx`:

```typescript
// Line 31: Max visible distance
const maxDistanceKm = 10; // 10km radius

// Line 50: Neighbor distance for pathfinding
const MAX_NEIGHBOR_DISTANCE = 50; // meters

// Line 185: Walking speed for ETA
const walkingSpeed = 1.4; // m/s

// Line 186: Movement threshold
const speedThreshold = 0.5; // m/s
```

## Troubleshooting

### No markers showing
- Check: Are there any points in `location/location.json`?
- Check: Is user location within 10km of center point?
- Check: Look at debug info for "Visible: X/Y points"

### Route not showing
- Check: Is user location available?
- Check: Are start and end points within 50m of other points?
- Check: Look at console for route calculation logs

### User location not showing
- Check: Location permissions granted?
- Check: GPS enabled on device?
- Check: Indoor GPS may not work well

### Performance issues
- Reduce number of points in JSON
- Increase visible distance threshold
- Disable debug info in production

---

**Last Updated**: 2025-10-12
**Version**: 2.0.0 (Clean Rebuild)

