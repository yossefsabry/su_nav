// Positions - Navigation vertices on the map
// Adapted from mockup for React Native

import React from 'react';
import { Circle, G } from 'react-native-svg';
import { VertexData } from '@/types/indoor-map';

interface PositionsProps {
  vertices: VertexData[];
  positionRadius?: number;
  activePosition?: string;
  visible?: boolean;
  onPositionPress?: (vertexId: string) => void;
}

export function Positions({
  vertices,
  positionRadius = 8,
  activePosition,
  visible = false,
  onPositionPress,
}: PositionsProps) {
  const positionBackgroundColor = '#4285f4';
  const positionBackgroundRadius = positionRadius + 7;
  const positionBackgroundOpacity = 0.2;

  const activeVertex = vertices.find(v => v.id === activePosition);

  return (
    <G id="Positions">
      {/* Background circle for active position (Google Maps style) */}
      {activeVertex && (
        <Circle
          cx={activeVertex.cx}
          cy={activeVertex.cy}
          r={positionBackgroundRadius}
          fill={positionBackgroundColor}
          opacity={positionBackgroundOpacity}
        />
      )}

      {/* Render all vertices */}
      {vertices.map((vertex) => {
        const isActive = vertex.id === activePosition;
        const shouldShow = visible || isActive;
        
        // Don't show positions that are attached to objects unless active
        if (vertex.objectName && !isActive) return null;

        return (
          <Circle
            key={vertex.id}
            cx={vertex.cx}
            cy={vertex.cy}
            r={positionRadius}
            fill={isActive ? '#4285f4' : 'rgba(129, 129, 129, 0.557)'}
            opacity={shouldShow ? 1 : 0}
            onPress={() => onPositionPress?.(vertex.id)}
          />
        );
      })}

      {/* Active position indicator ring */}
      {activeVertex && (
        <Circle
          cx={activeVertex.cx}
          cy={activeVertex.cy}
          r={positionRadius + 4}
          fill="none"
          stroke="white"
          strokeWidth={3}
          opacity={0.8}
        />
      )}
    </G>
  );
}
