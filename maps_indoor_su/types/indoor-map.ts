// Indoor map types - adapted from mockup with multi-floor support

export interface VertexData {
  id: string;
  objectName: string | null; // Reference to an object (room, shop, etc.)
  cx: number; // X coordinate in SVG viewBox
  cy: number; // Y coordinate in SVG viewBox
  floor?: number; // Floor number (0-3 for 4 floors)
}

export interface EdgeData {
  id: string;
  from: string; // Vertex ID
  to: string; // Vertex ID
  floor?: number; // Floor number
}

export interface ObjectData {
  id: string;
  name: string;
  desc?: string;
  path: string; // SVG path data
  categoryId?: string;
  floor?: number; // Floor number
}

export interface FloorData {
  floor: number;
  name: string;
  vertices: VertexData[];
  edges: EdgeData[];
  objects: ObjectData[];
  viewBox: string; // SVG viewBox for this floor
  backgroundImage?: string; // Floor plan image
}

export interface GraphData {
  vertices: VertexData[];
  edges: EdgeData[];
  objects: ObjectData[];
}

export interface Navigation {
  start: string;
  end?: string;
  floor?: number;
}

export interface NavigationRoute {
  path: string[]; // Array of vertex IDs
  distance: number;
  floors: number[]; // Floors involved in the route
}
