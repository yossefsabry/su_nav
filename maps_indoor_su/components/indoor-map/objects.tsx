// Objects - Interactive rooms/areas on the map
// Adapted from mockup for React Native

import React from 'react';
import { G, Path } from 'react-native-svg';
import { ObjectData } from '@/types/indoor-map';

interface ObjectsProps {
  objects: ObjectData[];
  onObjectPress?: (object: ObjectData) => void;
  highlightedObject?: string;
}

export function Objects({
  objects,
  onObjectPress,
  highlightedObject,
}: ObjectsProps) {
  const objectColor = '#c1c1c1';
  const objectOpacity = 0.1;
  const objectHoverOpacity = 0.5;

  return (
    <G id="Objects">
      {objects.map((object) => {
        const isHighlighted = object.id === highlightedObject || object.name === highlightedObject;
        
        return (
          <Path
            key={object.id}
            d={object.path}
            fill={objectColor}
            opacity={isHighlighted ? objectHoverOpacity : objectOpacity}
            strokeOpacity={0}
            onPress={() => onObjectPress?.(object)}
          />
        );
      })}
    </G>
  );
}
