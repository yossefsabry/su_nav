// Paths - Navigation edges/routes on the map
// Adapted from mockup for React Native

import React from 'react';
import { G, Path } from 'react-native-svg';
import { EdgeData, VertexData } from '@/types/indoor-map';

interface PathsProps {
  edges: EdgeData[];
  vertices: VertexData[];
  activePath?: string[]; // Array of vertex IDs in the route
  showAllPaths?: boolean;
}

export function Paths({
  edges,
  vertices,
  activePath,
  showAllPaths = false,
}: PathsProps) {
  const pathColor = '#488af4';
  const activePathColor = '#FF6B6B';

  // Generate path data from vertices
  const getPathD = (edge: EdgeData): string | null => {
    const fromVertex = vertices.find(v => v.id === edge.from);
    const toVertex = vertices.find(v => v.id === edge.to);
    
    if (!fromVertex || !toVertex) return null;
    
    return `M${fromVertex.cx} ${fromVertex.cy}L${toVertex.cx} ${toVertex.cy}`;
  };

  // Check if edge is part of active route
  const isActivePath = (edge: EdgeData): boolean => {
    if (!activePath || activePath.length < 2) return false;
    
    for (let i = 0; i < activePath.length - 1; i++) {
      if (
        (edge.from === activePath[i] && edge.to === activePath[i + 1]) ||
        (edge.to === activePath[i] && edge.from === activePath[i + 1])
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <G id="Paths">
      {/* Base paths (corridors) */}
      {edges.map((edge) => {
        const pathD = getPathD(edge);
        if (!pathD) return null;

        const active = isActivePath(edge);
        
        return (
          <Path
            key={edge.id}
            d={pathD}
            stroke={pathColor}
            strokeWidth={active ? 4 : 1}
            strokeLinecap={active ? 'round' : 'butt'}
            strokeLinejoin={active ? 'round' : 'miter'}
            opacity={active || showAllPaths ? 1 : 0}
            fill="none"
          />
        );
      })}

      {/* Active route overlay */}
      {activePath && activePath.length > 1 && (
        <Path
          d={generateRoutePathD(activePath, vertices)}
          stroke={activePathColor}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.8}
        />
      )}
    </G>
  );
}

// Generate complete route path from vertex IDs
function generateRoutePathD(vertexIds: string[], vertices: VertexData[]): string {
  if (vertexIds.length < 2) return '';
  
  const points = vertexIds
    .map(id => vertices.find(v => v.id === id))
    .filter((v): v is VertexData => v !== undefined);
  
  if (points.length < 2) return '';
  
  const pathCommands = points.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command}${point.cx} ${point.cy}`;
  });
  
  return pathCommands.join('');
}
