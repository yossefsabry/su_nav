// Indoor map graph data - Using actual data from mockup
// This is the mall floor plan from the mockup - will be replaced with campus data

import { GraphData } from '@/types/indoor-map';

// Real graph data from the mockup (subset for demo)
export const indoorGraphData: GraphData = {
  vertices: [
    { id: "v1", objectName: null, cx: 361.105, cy: 512.811 },
    { id: "v2", objectName: null, cx: 237.691, cy: 512.811 },
    { id: "v3", objectName: "Zara", cx: 237.691, cy: 905.781 },
    { id: "v4", objectName: "McShark", cx: 361.105, cy: 905.781 },
    { id: "v5", objectName: "Nike", cx: 490.616, cy: 905.781 },
    { id: "v6", objectName: "Adidas", cx: 622.812, cy: 905.781 },
    { id: "v7", objectName: "Primark", cx: 754.244, cy: 905.781 },
    { id: "v8", objectName: "Svarovski", cx: 889.316, cy: 905.781 },
    { id: "v9", objectName: "H&M", cx: 1020.234, cy: 905.781 },
    { id: "v10", objectName: "Gucci", cx: 361.105, cy: 474.539 },
    { id: "v11", objectName: "Louis Vuitton", cx: 542.482, cy: 474.539 },
    { id: "v12", objectName: "KFC", cx: 779.083, cy: 474.539 },
    { id: "v13", objectName: "McDonald's", cx: 1017.929, cy: 474.539 },
    { id: "v22", objectName: null, cx: 361.105, cy: 873.505 },
    { id: "v23", objectName: null, cx: 237.691, cy: 873.505 },
    { id: "v26", objectName: null, cx: 542.482, cy: 512.811 },
    { id: "v27", objectName: null, cx: 779.083, cy: 512.811 },
    { id: "v28", objectName: null, cx: 1017.929, cy: 512.811 },
    { id: "v35", objectName: null, cx: 1156.16, cy: 970.567 },
    { id: "v34", objectName: "Entrance", cx: 1157.655, cy: 1072.459 },
  ],

  edges: [
    { id: "e1", from: "v1", to: "v2" },
    { id: "e2", from: "v2", to: "v23" },
    { id: "e3", from: "v23", to: "v3" },
    { id: "e4", from: "v22", to: "v23" },
    { id: "e5", from: "v22", to: "v4" },
    { id: "e6", from: "v1", to: "v26" },
    { id: "e7", from: "v26", to: "v27" },
    { id: "e8", from: "v27", to: "v28" },
    { id: "e9", from: "v1", to: "v10" },
    { id: "e10", from: "v26", to: "v11" },
    { id: "e11", from: "v27", to: "v12" },
    { id: "e12", from: "v28", to: "v13" },
    { id: "e13", from: "v28", to: "v35" },
    { id: "e14", from: "v35", to: "v34" },
  ],

  objects: [
    {
      id: "zara",
      name: "Zara",
      desc: "Fashion Retail",
      path: "M172.029 911.04l122.833-.164-.243 116.283-122.709.667.119-116.786z",
    },
    {
      id: "mcshark",
      name: "McShark",
      desc: "Fast Food",
      path: "M303.324 910.876l120.253.333-2.042 115.252-118.443.698.232-116.283z",
    },
    {
      id: "nike",
      name: "Nike",
      desc: "Sports Apparel",
      path: "M430.273 910.876l120.253.333-1.054 114.46-119.468.792.269-115.585z",
    },
    {
      id: "adidas",
      name: "Adidas",
      desc: "Sports Apparel",
      path: "M558.987 911.04l116.848.003-1.024 114.297-116.619.503.795-114.803z",
    },
    {
      id: "primark",
      name: "Primark",
      desc: "Fashion Retail",
      path: "M684.126 911.04l123.189.003-1.08 114.297-122.947.503.838-114.803z",
    },
    {
      id: "gucci",
      name: "Gucci",
      desc: "Luxury Fashion",
      path: "M288.483 359.374l158.26-.059.095 111.54-158.409-.018.054-111.463z",
    },
    {
      id: "louisvuitton",
      name: "Louis Vuitton",
      desc: "Luxury Fashion",
      path: "M455.473 359.466l179.713-.037.126 111.555-179.919-.293.08-111.225z",
    },
    {
      id: "kfc",
      name: "KFC",
      desc: "Fast Food",
      path: "M696.664 238.508l171.452-.046.021 232.906-171.458-.113-.015-232.747z",
    },
    {
      id: "mcdonalds",
      name: "McDonald's",
      desc: "Fast Food",
      path: "M935.02 239.647l171.451-.046.022 232.493-171.625.071.151-232.518z",
    },
  ],
};

// Floor data structure for future multi-floor support
export const floorData = [
  {
    floor: 0,
    name: 'Ground Floor',
    vertices: indoorGraphData.vertices.map(v => ({ ...v, floor: 0 })),
    edges: indoorGraphData.edges.map(e => ({ ...e, floor: 0 })),
    objects: indoorGraphData.objects.map(o => ({ ...o, floor: 0 })),
    viewBox: '0.469 0.006 1461.95 1149.136', // From the actual SVG
    backgroundImage: require('@/assets/maps/mall-floor-plan.svg'), // Mall floor plan from mockup
  },
  // Placeholder for floors 1-3 (campus building)
  // { floor: 1, name: 'First Floor', ... },
  // { floor: 2, name: 'Second Floor', ... },
  // { floor: 3, name: 'Third Floor', ... },
];

// Helper to get current floor data (default to floor 0)
export function getFloorData(floor: number = 0) {
  return floorData.find(f => f.floor === floor) || floorData[0];
}
