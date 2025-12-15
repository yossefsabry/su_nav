# Indoor Maps SU 🗺️

A modern indoor **navigation application** built with React Native and Expo. Navigate to specific places within your mapped area using real-time GPS, turn-by-turn directions, magnetic field-based indoor positioning, and AR camera features.

**This app USES location data to provide navigation - it's not a data collection tool.**

## ✨ Features

### 🎯 Navigation Features
- **2 KM Geofence**: Automatically checks if you're within range of mapped area
- **Turn-by-Turn Directions**: Real-time navigation instructions (e.g., "Turn right - Head E for 50m")
- **Interactive Map**: Shows all locations from your data files with custom markers
- **Smart Search**: Find any location by name instantly
- **Auto-Arrival**: Automatically detects when you've reached your destination
- **Route Visualization**: See your path with a blue dashed line on the map

### 🧭 Location Features
- **Real-time GPS**: Continuous location updates with sub-meter accuracy
- **Indoor Positioning**: Magnetic field-based positioning for indoor navigation
- **Compass Directions**: 8-point compass (N, NE, E, SE, S, SW, W, NW)
- **Distance Display**: Real-time distance to destination
- **Heading Indicator**: Visual arrow showing your direction

### 📱 User Experience
- **Modern UI**: Dark mode with glassmorphic blur effects
- **AR Camera Mode**: View position data in augmented reality
- **Out of Range Screen**: Clear feedback when too far from mapped area
- **Live Instructions**: Navigation banner with real-time updates
- **One-Tap Navigation**: Select location → Tap button → Start navigating

## 🏗️ Architecture

### Technology Stack
- **Framework**: React Native with Expo
- **Maps**: react-native-maps (Google Maps)
- **Location**: expo-location
- **Camera**: expo-camera
- **Sensors**: expo-sensors (Magnetometer)
- **UI**: expo-blur, Ionicons
- **Language**: TypeScript

### Project Structure

```
maps_indoor_su/
├── app/
│   └── (tabs)/
│       └── index.tsx          # Main app screen
├── components/
│   ├── map-view.tsx           # Main map component
│   ├── camera-view.tsx        # AR camera view
│   └── search-modal.tsx       # Location search modal
├── hooks/
│   ├── use-location-tracking.ts  # Location & magnetometer tracking
│   └── use-camera.ts             # Camera permissions
├── services/
│   └── indoor-positioning.ts     # Indoor positioning algorithms
├── types/
│   └── location.ts               # TypeScript types
└── location/
    ├── location_points.json      # GPS location data
    └── ground_right.json         # Magnetic field fingerprints
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. **Clone and install dependencies**:
```bash
cd maps_indoor_su
npm install
```

2. **Configure Google Maps** (Android):
   - Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Update `app.json`:
```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_ACTUAL_API_KEY_HERE"
    }
  }
}
```

3. **Run the app**:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📊 Data Format

### Location Points (`location/location_points.json`)
```json
[
  {
    "id": 1760036946730,
    "longitude": 33.630906,
    "latitude": 28.24906,
    "altitude": 37.8,
    "accuracy": 15.6,
    "timestamp": "2025-10-09T19:09:06.731Z",
    "label": "1"
  }
]
```

### Magnetic Fingerprints (`location/ground_right.json`)
```json
[
  {
    "x": 228,
    "y": 888,
    "Bx": "32.19",
    "By": "14.59",
    "Bz": "-40.56",
    "timestamp": "2025-10-09T18:29:15.740Z"
  }
]
```

## 🔧 How It Works

### Indoor Positioning System

The app uses **magnetic field fingerprinting** for indoor positioning:

1. **Data Collection**: Magnetic field measurements (Bx, By, Bz) are collected at known positions (x, y)
2. **Real-time Matching**: The device's magnetometer continuously measures the magnetic field
3. **Position Calculation**: The current magnetic signature is compared against the fingerprint database
4. **Confidence Scoring**: Position confidence is calculated based on match quality

### Location Tracking

- **GPS**: High-accuracy GPS with 1-second and 1-meter update intervals
- **Magnetometer**: 500ms update interval for indoor positioning
- **Fusion**: GPS and magnetic data are combined for optimal positioning

### Navigation Features

1. **Search**: Find locations by label, ID, or coordinates
2. **Route Planning**: Select a destination to calculate the route
3. **Turn-by-Turn**: Visual route displayed on the map
4. **AR Mode**: Camera overlay with position and heading information

## 🎨 UI Components

### Map View
- **Interactive Map**: Pan, zoom, and interact with location markers
- **User Marker**: Blue dot with heading indicator
- **Location Markers**: Custom markers for each point
- **Route Polyline**: Dashed blue line showing the route
- **Info Panels**: Real-time location and positioning data

### Camera View (AR)
- **Live Camera Feed**: Back or front camera
- **AR Overlay**: Crosshair and position information
- **Compass**: Real-time heading indicator
- **Location Card**: Current GPS and indoor position

### Search Modal
- **Real-time Search**: Filter locations as you type
- **Result List**: Scrollable list with location details
- **Quick Select**: Tap to select and navigate

## 📱 Permissions Required

### iOS
- Location (Always and When In Use)
- Camera
- Motion/Sensors

### Android
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- ACCESS_BACKGROUND_LOCATION
- CAMERA

## 🛠️ Customization

### Adding New Location Points

1. Edit `location/location_points.json`
2. Add new entries with required fields:
   - id (unique timestamp)
   - longitude, latitude
   - altitude, accuracy
   - timestamp (ISO 8601)
   - label (display name)

### Adding Magnetic Fingerprints

1. Edit `location/ground_right.json`
2. Add magnetic field readings:
   - x, y (position coordinates)
   - Bx, By, Bz (magnetic field in μT)
   - timestamp

### Customizing UI

Colors and styles are defined in component StyleSheets. Key colors:
- Primary: `#007AFF` (iOS blue)
- Success: `#34C759` (green)
- Error: `#FF3B30` (red)
- Warning: `#FFD60A` (yellow)

## 🧪 Testing

1. **Location Tracking**: Test in an open area with clear GPS signal
2. **Indoor Positioning**: Test in areas with magnetic fingerprint data
3. **Camera**: Test AR features with sufficient lighting
4. **Navigation**: Test route calculation between known points

## 📈 Performance

- **Location Updates**: 1 Hz (1 update per second)
- **Magnetometer**: 2 Hz (2 updates per second)
- **Map Rendering**: 60 FPS with hardware acceleration
- **Battery Optimized**: Efficient sensor polling and updates

## 🔒 Privacy

- Location data is processed locally on device
- No data is transmitted to external servers
- Camera feed is not recorded or saved
- All permissions are requested with clear explanations

## 🐛 Troubleshooting

### Maps not showing
- Check Google Maps API key configuration
- Ensure location permissions are granted
- Verify internet connectivity

### Indoor positioning not working
- Ensure magnetometer is calibrated (wave phone in figure-8 pattern)
- Verify magnetic fingerprint data is loaded
- Check that location has magnetic signature data

### Camera not working
- Grant camera permissions in settings
- Check camera is not being used by another app
- Restart the app if camera fails to initialize

## 📝 Future Enhancements

- [ ] Floor selection for multi-level buildings
- [ ] Bluetooth beacon integration
- [ ] WiFi-based positioning
- [ ] Voice-guided navigation
- [ ] Offline map support
- [ ] Points of interest (POI) database
- [ ] User-generated landmarks
- [ ] Social features (share locations)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ using React Native and Expo**
