# MVF Nodes

## 1. Introduction

Nodes describe paths a person can walk around on in an MVF. There is a single file of nodes per floor, and those files will describe how to walk around on that floor. Going from one floor to another, or through things like travelators or doors, are done by [Connections](../modules/_mappedin_mvf-connections.html).

Nodes also make use of the [NavigationFlags](../modules/_mappedin_mvf-navigation-flags.html) extension to indicate under what situations a node's edge may be used. For example, if a user
is in a wheelchair, they can cross edges that have the Well Known `accessible` flag set.

Nodes link back to other extensions through shared geometry. For example, to navigate to a specific [Location](../modules/_mappedin_mvf-locations.html), that location must have a `GeometryAnchor` that is also referenced as one of the `geometryIds` of a node on that floor.

For developers using the MappedIn SDKs, nodes are typically not interacted with directly.

## 2. Specification

### 2.1 Node

Nodes are a GeoJSON Point geometry, with the following properties:

* `id`: a unique identifier for the node within the MVF, Should match the pattern `^n_[A-Za-z0-9-]+$`. **Important**: While the suffix can be any length, it is strongly recommended to use suffixes of at least 8 characters to ensure uniqueness and avoid collisions.
* `neighbors`: an array of nodes that this node can connect to, of the form:
  + `id`: the identifier of the neighbor node
  + `extraCost`: the additional cost of navigation to the neighbor node, above the straight line distance between the nodes. Must be >= 0.
  + `flags`: an array of navigation flags that control the behaviour of this edge further.
* `geometryIds`: an optional array of geometry that is linked to this node. This may be useful for a variety of reasons:
  + if navigating to a specific piece of geometry, this can be used to signal the end of navigation
  + used to bridge between nodes and connections to facilitate floor transitions
  + discovering landmarks or areas a path traverses
  + etc.

Nodes MUST only connect to other nodes on the same floor, and MUST NOT reference themselves in their neighbor list. Nodes MUST only reference geometry on the same floor. Navigation is permitted to traverse floors through information provided by other extensions -- [Connections](../modules/_mappedin_mvf-connections.html) as a primary example, though future extensions may provide additional functionality.

### 2.2 Nodes Collection

Data will be organized by floor ID, and will be a FeatureCollection of nodes.

## 3. File Structure

Node data will be stored as follows:

```
nodes/
âââ f_abcd1234.geojson
âââ f_defg5678.geojson
âââ f_hijk9012.geojson
Copy
```

Where `f_abcd1234`, `f_defg5678` and `f_hijk9012` are valid floor IDs.

## Example

This example demonstrates a two node network, on a single floor. If a user were at
`n_000001`, they could walk to `n_000002` to reach the destination geometry `g_000001`.

You cannot walk back.

```
{
	"nodes": {
		"f_000001": {
			"type": "FeatureCollection",
			"features": [
				{
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": [10.0, 10.0]
					},
					"properties": {
						"id": "n_000001",
						"neighbors": [
							{
								"id": "n_000002",
								"extraCost": 10,
								"flags": [0]
							}
						],
						"geometryIds": []
					},
				},
				{
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": [10.0, 10.0]
					},
					"properties": {
						"id": "n_000002",
						"neighbors": [],
						"geometryIds": ["g_000001"]
					},
				}
			]
		}
	}
}
Copy
```