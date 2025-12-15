import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { MapView, Mappedin, hydrateMapData } from "@mappedin/react-native-sdk";
import * as FileSystem from "expo-file-system";
import * as Asset from "expo-asset";

export default function OfflineMap() {
  const [mapData, setMapData] = useState<any>(null);

  useEffect(() => {
    async function loadOfflineMap() {
      // Load local asset (my_data.zip)
      const asset = Asset.Asset.fromModule(require("../assets/my_data.zip"));
      await asset.downloadAsync();

      // Read the binary ZIP data
      const fileUri = asset.localUri || asset.uri;
      const zipBinary = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert Base64 → ArrayBuffer
      const arrayBuffer = Uint8Array.from(
        atob(zipBinary),
        (c) => c.charCodeAt(0)
      ).buffer;

      // Hydrate MVF using Mappedin SDK
      const hydrated = await hydrateMapData({
        type: "binary",
        main: arrayBuffer,
      });

      setMapData(hydrated);
    }

    loadOfflineMap();
  }, []);

  if (!mapData) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <MapView
      style={{ flex: 1 }}
      mapData={mapData}
      onMapReady={() => console.log("Offline map loaded")}
    />
  );
}

