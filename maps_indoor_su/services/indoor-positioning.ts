import magneticData from '@/location/BXYZ.json';
import locationPoints from '@/location/location.json';
import { IndoorPosition, LocationPoint, MagneticFieldData } from '@/types/location';

// Base location coordinates for geofence checking
export const BASE_LOCATION = {
  latitude: 28.249712366684193,
  longitude: 33.6305180207602,
  radius: 2000, // 2000 meters radius
};

// Cache location points in memory to avoid repeated JSON parsing
let cachedLocationPoints: LocationPoint[] | null = null;

/**
 * Calculate Euclidean distance between two magnetic field vectors
 */
function calculateMagneticDistance(
  m1: { Bx: string; By: string; Bz: string },
  m2: { Bx: string; By: string; Bz: string }
): number {
  const bx1 = parseFloat(m1.Bx);
  const by1 = parseFloat(m1.By);
  const bz1 = parseFloat(m1.Bz);
  
  const bx2 = parseFloat(m2.Bx);
  const by2 = parseFloat(m2.By);
  const bz2 = parseFloat(m2.Bz);
  
  return Math.sqrt(
    Math.pow(bx1 - bx2, 2) +
    Math.pow(by1 - by2, 2) +
    Math.pow(bz1 - bz2, 2)
  );
}

/**
 * Find indoor position based on magnetic field fingerprinting
 */
export function findIndoorPosition(
  currentMagnetic: { Bx: number; By: number; Bz: number }
): IndoorPosition | null {
  if (!magneticData || magneticData.length === 0) {
    return null;
  }

  const currentField = {
    Bx: currentMagnetic.Bx.toFixed(2),
    By: currentMagnetic.By.toFixed(2),
    Bz: currentMagnetic.Bz.toFixed(2),
  };

  let bestMatch: MagneticFieldData | null = null;
  let minDistance = Infinity;

  // Find the closest magnetic signature
  for (const data of magneticData as MagneticFieldData[]) {
    const distance = calculateMagneticDistance(currentField, data);
    
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = data;
    }
  }

  if (!bestMatch) {
    return null;
  }

  // Calculate confidence based on distance (lower distance = higher confidence)
  // Using an exponential decay function
  const confidence = Math.exp(-minDistance / 10) * 100;

  return {
    x: bestMatch.x,
    y: bestMatch.y,
    confidence: Math.min(confidence, 100),
    matchedPoint: bestMatch,
  };
}

/**
 * Get all location points (cached for performance)
 */
export function getLocationPoints(): LocationPoint[] {
  if (!cachedLocationPoints) {
    cachedLocationPoints = locationPoints as LocationPoint[];
  }
  return cachedLocationPoints;
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 */
export function calculateGPSDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if user is within the allowed geofence
 */
export function isWithinGeofence(
  userLatitude: number,
  userLongitude: number
): { isWithin: boolean; distance: number } {
  const distance = calculateGPSDistance(
    userLatitude,
    userLongitude,
    BASE_LOCATION.latitude,
    BASE_LOCATION.longitude
  );

  return {
    isWithin: distance <= BASE_LOCATION.radius,
    distance: Math.round(distance),
  };
}

/**
 * Calculate bearing (direction) between two points
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
           Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180 / Math.PI) + 360) % 360;
  
  return bearing;
}

/**
 * Get compass direction from bearing
 */
export function getCompassDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Calculate navigation instructions to a destination
 */
export function getNavigationInstructions(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  userHeading?: number
): {
  distance: number;
  bearing: number;
  direction: string;
  instruction: string;
} {
  const distance = calculateGPSDistance(fromLat, fromLon, toLat, toLon);
  const bearing = calculateBearing(fromLat, fromLon, toLat, toLon);
  const direction = getCompassDirection(bearing);
  
  let instruction = '';
  
  if (distance < 5) {
    instruction = 'You have arrived at your destination';
  } else if (distance < 20) {
    instruction = `Walk ${direction} for ${Math.round(distance)}m`;
  } else {
    instruction = `Head ${direction} for ${Math.round(distance)}m`;
  }
  
  // Add turn instruction if user heading is available
  if (userHeading !== undefined && userHeading !== null) {
    const turnAngle = (bearing - userHeading + 360) % 360;
    
    if (turnAngle < 30 || turnAngle > 330) {
      instruction = 'Continue straight - ' + instruction;
    } else if (turnAngle >= 30 && turnAngle < 150) {
      instruction = 'Turn right - ' + instruction;
    } else if (turnAngle >= 150 && turnAngle < 210) {
      instruction = 'Turn around - ' + instruction;
    } else {
      instruction = 'Turn left - ' + instruction;
    }
  }
  
  return {
    distance: Math.round(distance),
    bearing: Math.round(bearing),
    direction,
    instruction,
  };
}

/**
 * Find nearest location point based on GPS coordinates
 */
export function findNearestLocationPoint(
  latitude: number,
  longitude: number
): LocationPoint | null {
  const points = getLocationPoints();
  
  if (points.length === 0) {
    return null;
  }

  let nearestPoint: LocationPoint | null = null;
  let minDistance = Infinity;

  for (const point of points) {
    const distance = calculateGPSDistance(
      latitude,
      longitude,
      point.latitude,
      point.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  }

  return nearestPoint;
}

/**
 * Calculate route between two points using A* pathfinding algorithm
 */
interface PathNode {
  point: LocationPoint;
  parent: PathNode | null;
  g: number; // Cost from start
  h: number; // Heuristic to end
  f: number; // Total cost
}

export function calculateRoute(
  start: LocationPoint,
  end: LocationPoint
): LocationPoint[] {
  const points = getLocationPoints();
  
  // If start and end are very close, return direct path
  const directDistance = calculateGPSDistance(
    start.latitude,
    start.longitude,
    end.latitude,
    end.longitude
  );
  
  if (directDistance < 20) {
    return [start, end];
  }
  
  // Build a simplified route using waypoints that are roughly along the path
  const MAX_NEIGHBOR_DISTANCE = 50; // meters - reduced for more direct paths
  
  // A* algorithm
  const openSet: PathNode[] = [];
  const closedSet = new Set<number>();
  
  const startNode: PathNode = {
    point: start,
    parent: null,
    g: 0,
    h: calculateGPSDistance(start.latitude, start.longitude, end.latitude, end.longitude),
    f: 0,
  };
  startNode.f = startNode.g + startNode.h;
  openSet.push(startNode);
  
  const nodeMap = new Map<number, PathNode>();
  nodeMap.set(start.id, startNode);
  
  let iterations = 0;
  const MAX_ITERATIONS = 200;
  
  while (openSet.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    
    // Get node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    
    // Check if we reached the goal
    if (current.point.id === end.id) {
      // Reconstruct path
      const path: LocationPoint[] = [];
      let node: PathNode | null = current;
      while (node !== null) {
        path.unshift(node.point);
        node = node.parent;
      }
      return path;
    }
    
    closedSet.add(current.point.id);
    
    // Find neighbors - points within MAX_NEIGHBOR_DISTANCE
    const neighbors = points.filter(other => {
      if (closedSet.has(other.id) || other.id === current.point.id) return false;
      const dist = calculateGPSDistance(
        current.point.latitude,
        current.point.longitude,
        other.latitude,
        other.longitude
      );
      return dist <= MAX_NEIGHBOR_DISTANCE;
    });
    
    // Always add end point as a potential neighbor if it's close enough
    const distToEnd = calculateGPSDistance(
      current.point.latitude,
      current.point.longitude,
      end.latitude,
      end.longitude
    );
    
    if (distToEnd <= MAX_NEIGHBOR_DISTANCE * 2 && !closedSet.has(end.id)) {
      neighbors.push(end);
    }
    
    for (const neighbor of neighbors) {
      const distToNeighbor = calculateGPSDistance(
        current.point.latitude,
        current.point.longitude,
        neighbor.latitude,
        neighbor.longitude
      );
      
      const tentativeG = current.g + distToNeighbor;
      
      let neighborNode = nodeMap.get(neighbor.id);
      
      if (!neighborNode) {
        neighborNode = {
          point: neighbor,
          parent: current,
          g: tentativeG,
          h: calculateGPSDistance(neighbor.latitude, neighbor.longitude, end.latitude, end.longitude),
          f: 0,
        };
        neighborNode.f = neighborNode.g + neighborNode.h;
        nodeMap.set(neighbor.id, neighborNode);
        openSet.push(neighborNode);
      } else if (tentativeG < neighborNode.g) {
        neighborNode.parent = current;
        neighborNode.g = tentativeG;
        neighborNode.f = neighborNode.g + neighborNode.h;
        
        if (!openSet.includes(neighborNode)) {
          openSet.push(neighborNode);
        }
      }
    }
  }
  
  // If no path found, return direct line
  return [start, end];
}

