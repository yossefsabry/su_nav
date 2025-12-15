export interface LocationPoint {
  id: number;
  longitude: number;
  latitude: number;
  altitude: number;
  accuracy: number;
  timestamp: string;
  label: string;
}

export interface MagneticFieldData {
  x: number;
  y: number;
  Bx: string;
  By: string;
  Bz: string;
  timestamp: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface IndoorPosition {
  x: number;
  y: number;
  confidence: number;
  matchedPoint?: MagneticFieldData;
}

export interface NavigationRoute {
  origin: LocationPoint;
  destination: LocationPoint;
  waypoints: LocationPoint[];
  distance: number;
  duration: number;
}

