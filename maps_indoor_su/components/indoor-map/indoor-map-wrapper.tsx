// IndoorMapWrapper - Main container with zoom/pan gestures
// Adapted from mockup for React Native with proper Reanimated support

import React, { useCallback } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MapBackground } from './map-background';
import { Objects } from './objects';
import { Paths } from './paths';
import { Positions } from './positions';
import { GraphData, ObjectData } from '@/types/indoor-map';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface IndoorMapWrapperProps {
  graphData: GraphData;
  viewBox?: string;
  activePosition?: string;
  activePath?: string[];
  showPositions?: boolean;
  onObjectPress?: (object: ObjectData) => void;
  onPositionPress?: (vertexId: string) => void;
}

export function IndoorMapWrapper({
  graphData,
  viewBox = '0 0 1000 1000',
  activePosition,
  activePath,
  showPositions = false,
  onObjectPress,
  onPositionPress,
}: IndoorMapWrapperProps) {
  // Min/Max zoom levels
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 4;

  // Animated values using Reanimated
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Pinch gesture with focal point
  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, savedScale.value * event.scale));
      scale.value = newScale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Compose gestures to run simultaneously
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Reset zoom/pan
  const resetView = useCallback(() => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, []);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.mapContainer, animatedStyle]}>
          <MapBackground
            viewBox={viewBox}
            width={SCREEN_WIDTH * 2}
            height={SCREEN_HEIGHT * 2}
          >
            {/* Objects layer (rooms, areas) */}
            <Objects
              objects={graphData.objects}
              onObjectPress={onObjectPress}
            />

            {/* Paths layer (corridors, connections) */}
            <Paths
              edges={graphData.edges}
              vertices={graphData.vertices}
              activePath={activePath}
              showAllPaths={showPositions}
            />

            {/* Positions layer (navigation vertices) */}
            <Positions
              vertices={graphData.vertices}
              activePosition={activePosition}
              visible={showPositions}
              onPositionPress={onPositionPress}
            />
          </MapBackground>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
