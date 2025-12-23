# MVF Connections

## Introduction

Connections are things like elevators, escalators, doors, and ramps. They are a way to represent special links a person can use to traverse between specific geometries, on the same floor or between floors. This is separate from the [Nodes extension](../modules/_mappedin_mvf-nodes.html), which describes how to walk through the walkable space on each floor. Connections act more like a vortex: They have one or more entry points a person can enter, and they can exit at any one of the exit points, with the normal cost being a static entry cost and an additional cost per floor transitioned.

This implies that Connections work best when they connect two points on the same floor, or any number of points stacked on different floors. A connection with several exits all over a single floor, or where exits on other floors are spread out, will be difficult to cost correctly.

## Specification

### Connection

There will be a single `connections.json` file in the root of the bundle, containing an array of all connections objects for the MVF. A Connection MUST have the following properties:

* `id`, a unique identifier for the connection, matching the pattern `^c_[A-Za-z0-9_-]+$`. **Important**: While the suffix can be any length, it is strongly recommended to use suffixes of at least 8 characters to ensure uniqueness and avoid collisions.
* `entrances`, an array of [MVF Navigation Flags](../modules/_mappedin_mvf-navigation-flags.html)'s [FlaggedGeometryAnchors](../types/_mappedin_mvf-navigation-flags.index.FlaggedGeometryAnchor.html) that are entrances to the connection.
* `exits`, an array of FlaggedGeometryAnchors that are exits from the connection.
* `entryCost`, the static [cost](#navigation-cost) to enter the connection. It MUST be greater than or equal to 0.
* `floorCostMultiplier`, the additional [cost](#navigation-cost) for each floor transitioned. It MUST be greater than 1.
* `type`, a safe string enum [connection type](#connection-type) for the connection, such as `elevator`, `escalator`, `door`, `ramp`, or `unknown`.

It MAY also have the following optional properties:

* `details`, a [Details](../types/_mappedin_mvf-core.utility-types_details_details.Details.html) object to describe basic metadata.
* `extra`, an [Extra](../types/_mappedin_mvf-core.utility-types_extra_extra.Extra.html) object of arbitrary key-value pairs.

### Entrances and Exits

Entrances and Exits are arrays of [FlaggedGeometryAnchors](../types/_mappedin_mvf-navigation-flags.index.FlaggedGeometryAnchor.html). Each item describes a specific place on the map that a person can enter (or exit) a Connection, along with the navigation flags that have been set for it's use. They may anchor to any type of geometry.

A connection MUST have at least one unique entrance and one unique exit, though for many connections the entrance and exit arrays will be the same set of two or more anchors. If the arrays are NOT the same, it implies some sort of directionality. Eg, an Escalator will have a separate entrance and exit, as the direction of travel is fixed:

```
{
 "id": "c_1",
 "type": "escalator",
 "entryCost": 0,
 "floorCostMultiplier": 10,
 "entrances": [
  {
   "geometryId": "g_1",
   "floorId": "f_1",
   "flags": [0]
  }
 ],
 "exits": [
  {
   "geometryId": "g_1",
   "floorId": "f_2",
   "flags": [0]
  }
 ]
}
Copy
```

A door may have a separate entrance and exit, to indicate a one way path, but it's more likely to have the same pair of anchors in both arrays:

```
{
 "id": "c_1",
 "type": "door",
 "entrances": [
  {
   "geometryId": "g_1",
   "floorId": "f_1",
   "flags": [1]
  },
  {
   "geometryId": "g_2",
   "floorId": "f_1",
   "flags": [1]
  }

 ],
 "exits": [
  {
   "geometryId": "g_1",
   "floorId": "f_1",
   "flags": [1]
  },
  {
   "geometryId": "g_2",
   "floorId": "f_1",
   "flags": [1]
  }
 ]
}
Copy
```

The list of entrances and exits MAY have anchors that only differ by Navigation Flag. For example, consider a `public` Navigation flag:

```
{
 "key": "public",
 "index": 0,
 "bit": 1,
}
Copy
```

along with the Well Known Accessible flag at bit 0.

There may be an Elevator that can be Entered from every floor, but the second floor is not public and only accessible to certain users.

```
{
 "id": "c_1",
 "type": "elevator",
 "entrances": [
  {
   "geometryId": "g_1",
   "floorId": "f_1",
   "flags": [3] // 1 * 2^0 + 1 * 2^1 = 3, ie it is 'accessible' and 'public'
  },
  {
   "geometryId": "g_2",
   "floorId": "f_2",
   "flags": [3]
  },
  {
   "geometryId": "g_3",
   "floorId": "f_3",
   "flags": [3]
  }
 ],
 "exits": [
  {
   "geometryId": "g_1",
   "floorId": "f_1",
   "flags": [3]
  },
  {
   "geometryId": "g_2",
   "floorId": "f_2",
   "flags": [1] // Accessible, but not public
  },
  {
   "geometryId": "g_3",
   "floorId": "f_2",
   "flags": [3]
  }
 ]
}
Copy
```

This means that when wayfinding with the "Public" flag set, a person can use the elevator from any floor, but can only exit on the first and third floors. The same is true with BOTH accessible and public flags set. A user with private access may wayfind with the "Accessible" flag set, and could enter and exit from any floor.

This extension does not strictly depend on the [Nodes](../modules/_mappedin_mvf-nodes.html) extension, but if they are being used together each anchor SHOULD also be referenced by a Node, if the intent is to connect **to** or **from** the rest of the node graph through this Connection. However it is valid to use this extension on it's own, or to have Connections connected directly to other Connections, or to an anchor without a Node that should then be used as part of some other wayfinding process defined by another extension.

### Connection Type

A connection type is a string that describes the type of connection. It is a SafeStringEnum that SHOULD be one of the following: `elevator`, `escalator`, `door`, `ramp`, `stairs`, `travelator`, `ladder`, or `unknown`.

`unknown` is a special type that is not normally used directly. It is NOT considered a breaking change for an MVF to contain new types that are not present in this list.

Libraries that parse or create an MVF bundle MUST downgrade any types not present in the version of the specification they are targeting to `unknown`. The Mappedin MVF library will perform this downgrade automatically via the SafeStringEnum parser. Any other parser must handle this downgrade itself.

Applications that consume MVFs MUST continue to provide wayfinding with unknown connection types present.

For example, some future version of the spec add a `slide` connection type. Applications producing MVFs may then create a Slide tool. Users may create new Slides on existing maps, or convert incorrectly modeled "Ramps" into Slides. At that point, new MVFs will be produced for that venue which will contain `slide` type Connections. An SDK consuming that MVF MUST ensure `slide` connections are downgraded to `unknown`. A existing in market application using that SDK may then start seeing `unknown` type connections. A user of that app must not have broken experience, even if the app does not, eg, have a Slide icon in their UI.

### Line String Doors with Nodes

If a Door connection has a line string representing it's physical geometry, and is connected to Nodes, it will be modeled in the following way:

* The Door's `entrance` array will reference the Line String geometry.
* The Door's `exit` array will reference one or two Point geometries. They MAY overlap with the line string.

To enter the door from one direction, there will be a Node referencing the Line String geometry, with neighboors connecting to the side of the door it's coming from. To enter the door from the OTHER direction, there will be a SECOND NODE, connecting to it's side of the node graph. The two entrance nodes WILL NOT BE NEIGHBORS.

To be an exit for the door, the node should also reference the Point geometry on their side.

Here is a simplified example:

```
{
	geometry: {
		f_1: {
			// a geometry feature collection with g_line, g_north_point, and g_south_point features
			 }
	},
	connections: [
		{
			id: "c_1",
			type: "door"
			entrances: ["g_line"],
			exits: ["g_north_point", "g_south_point"]
		}
	],
	nodes: {
		f_1: {
			features: [
				{
					id: "n_north_1",
					geometries: ["g_line", "g_north_point"],
					neighbors: ["n_north_2"], // NOT n_south_anything
				},
				{
					id: "n_south_1",
					geometries: ["g_line", "g_south_point"],
					neighbors: ["n_north_2"], // NOT n_north_anything
				},
			]
		}
	}
}
Copy
```

That is, the node graph going through a door is NOT DIRECTLY CONNECTED, and a door MUST be used to cross it.

## Navigation Cost

When wayfinding through a connection, the cost is the sum of the `entryCost` and the `floorCostMultiplier` times the absolute difference in elevation of the entry and exit floors. This value is then considered as the cost in meters to traverse the connection, and can be thought of as how far out of their way a person should walk to avoid that particular connection in favour of a cheaper option.

### A\* Considerations

The `entryCost` of a connection that enters and exits on the same floor is the ONLY cost paid to use it. It must be greater than or equal to 0, but it MAY be less than the straight line distance between the entrance and exit points.

This matters because when wayfinding using the [A\* algorithm](https://en.wikipedia.org/wiki/A%2A_search_algorithm.html), one typically uses the straight line distance from a node to the goal node as the heuristic. However, to be `admissable` according to A\*, the heuristic cannot underestimate the actual cost. Any connection who's `entryCost` is less than the distance between the entrance and exit points will break this assumption. `Travelators` are a good [example](#travelator) of this, but poorly costed `doors` or any `unknown` type connections can also break this assumption.

For this reason, when wayfinding using same-floor Connections, a different approach must be used. Failure to do so will still produce a valid path, but it may not be optimal.

### Examples

#### Stairs and Elevator

Consider a user at point A on floor 1. They would like to get to point B on floor 4. There exists a set of stairs that connects the two floors, with an entrance 1 meter away from A, and an exit 1 meter away from B. The stairs have an `entryCost` of 0, since a person can just walk on without waiting and a `floorCostMultiplier` of 10. The cost to traverse the stairs is then 0 + 10 \* (4 - 1) = 30 meters. Therefore the total path cost to get from A to B via the stairs is 32 meters.

Consider that there is also an elevator that connects the two floors. It has an `entryCost` of 10, since a person may have to wait for it to arrive. The elevator has a `floorCostMultiplier` of 1, since once a person is on the elevator it's very easy to traverse between floors. The cost to traverse the elevator is then 10 + 1 \* (4 - 1) = 13 meters.

The difference between the stairs path (32) and the cost of the elevator (13) is 19 meters. This means that it would be worth it for the person to walk up to 19 additional meters out of their way to get to and from the elevator, to avoid taking the stairs.

#### Travelator

Consider a user at point A on floor 1. They would like to get to point B on floor 1. The path cost through the node graph from A to B is 10 (meaning the distance walked is 10 meters, if there are no weights in the node graph).

There exists a travelator (ie, people mover, moving sidewalk, etc) that starts at point C and exits and point D. It is 1 meter from A to C, and 1 meter from B to D. The distance the travelator covers, B to D, is 10 meters. Since the travelator is faster than walking, it's `entryCost` should be set with regard to how much faster it is. If it's twice as fast the `entryCost` should be 5 meters. This means the cost to get from A to B via the travelator is 10 + 5 = 15 meters, less than the 20 meters of walking.

NOTE: The distance between the entrance and exit point (C and D in this case) is NOT a factor in the cost, though it may have been used to calculate the entry cost. Also note, this breaks admissibility the typical A\* heuristic. See [A\* Considerations](#a-considerations) for more details.