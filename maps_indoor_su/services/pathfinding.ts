// Dijkstra pathfinding algorithm
// Adapted from mockup for indoor navigation

import { GraphData, NavigationRoute } from '@/types/indoor-map';

interface GraphNode {
  id: string;
  distance: number;
  previous: string | null;
}

export function findPath(
  graphData: GraphData,
  startVertexId: string,
  endVertexId: string
): NavigationRoute | null {
  const { vertices, edges } = graphData;
  
  // Initialize nodes
  const nodes: Map<string, GraphNode> = new Map();
  vertices.forEach(vertex => {
    nodes.set(vertex.id, {
      id: vertex.id,
      distance: vertex.id === startVertexId ? 0 : Infinity,
      previous: null,
    });
  });

  // Unvisited set
  const unvisited = new Set(vertices.map(v => v.id));

  while (unvisited.size > 0) {
    // Find node with minimum distance
    let currentNode: GraphNode | null = null;
    let minDistance = Infinity;
    
    unvisited.forEach(nodeId => {
      const node = nodes.get(nodeId)!;
      if (node.distance < minDistance) {
        minDistance = node.distance;
        currentNode = node;
      }
    });

    if (!currentNode || currentNode.distance === Infinity) {
      break; // No path found
    }

    // Found the destination
    if (currentNode.id === endVertexId) {
      break;
    }

    unvisited.delete(currentNode.id);

    // Update neighbors
    const neighbors = getNeighbors(currentNode.id, edges);
    neighbors.forEach(neighborId => {
      if (!unvisited.has(neighborId)) return;

      const neighbor = nodes.get(neighborId)!;
      const edge = edges.find(
        e => (e.from === currentNode!.id && e.to === neighborId) ||
             (e.to === currentNode!.id && e.from === neighborId)
      );

      if (!edge) return;

      // Calculate distance (Euclidean distance between vertices)
      const fromVertex = vertices.find(v => v.id === currentNode!.id);
      const toVertex = vertices.find(v => v.id === neighborId);
      
      if (!fromVertex || !toVertex) return;

      const distance = Math.sqrt(
        Math.pow(toVertex.cx - fromVertex.cx, 2) +
        Math.pow(toVertex.cy - fromVertex.cy, 2)
      );

      const altDistance = currentNode!.distance + distance;

      if (altDistance < neighbor.distance) {
        neighbor.distance = altDistance;
        neighbor.previous = currentNode!.id;
      }
    });
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = endVertexId;
  
  while (current !== null) {
    path.unshift(current);
    const node = nodes.get(current);
    if (!node) break;
    current = node.previous;
  }

  // Check if path was found
  if (path.length === 0 || path[0] !== startVertexId) {
    return null;
  }

  const endNode = nodes.get(endVertexId);
  const distance = endNode ? endNode.distance : 0;

  // Get floors involved (for future multi-floor support)
  const floors = Array.from(new Set(
    path.map(vertexId => {
      const vertex = vertices.find(v => v.id === vertexId);
      return vertex?.floor || 0;
    })
  ));

  return {
    path,
    distance,
    floors,
  };
}

function getNeighbors(vertexId: string, edges: any[]): string[] {
  const neighbors: string[] = [];
  
  edges.forEach(edge => {
    if (edge.from === vertexId) {
      neighbors.push(edge.to);
    } else if (edge.to === vertexId) {
      neighbors.push(edge.from);
    }
  });

  return neighbors;
}

// Navigate to an object by finding the nearest vertex
export function navigateToObject(
  objectName: string,
  startVertexId: string,
  graphData: GraphData
): NavigationRoute | null {
  // Find vertex associated with this object
  const targetVertex = graphData.vertices.find(
    v => v.objectName === objectName
  );

  if (!targetVertex) {
    return null;
  }

  return findPath(graphData, startVertexId, targetVertex.id);
}
