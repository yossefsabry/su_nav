// MapBackground - SVG container for indoor map
// Adapted from mockup for React Native

import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';

interface MapBackgroundProps {
  viewBox: string;
  width: number;
  height: number;
  backgroundImage?: any;
  children: React.ReactNode;
}

export function MapBackground({ 
  viewBox, 
  width, 
  height, 
  children 
}: MapBackgroundProps) {
  return (
    <Svg
      viewBox={viewBox}
      width={width}
      height={height}
      style={styles.svg}
    >
      {/* Background rectangle */}
      <Rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="#f5f5f5"
      />
      
      <G id="map-content">
        {children}
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  svg: {
    backgroundColor: '#f5f5f5',
  },
});
