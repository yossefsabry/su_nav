# https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf.html

<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf.html
title: 
-->

## @mappedin/mvf

A starting point for interacting with MVF bundles. For Developers looking to get up and running with MVF, this is likely the best starting point.

### Default Parser

For most developers, the createMVFv3Parser function and associated type MVFv3 are what should be used. This provides an exporter parser, and a type for the parsed data for convenience.

```
import { createMVFv3Parser, type MVFv3 } from '@mappedin/mvf';

const parser = createMVFv3Parser().build().unwrap();

const myFunction = (data: MVFv3) => {
	// do something with the parsed data.
}

const mvf: MVFv3 = await parser.decompress(data).then((result) => result.unwrap());
const result = myFunction(data);
Copy
```

Note the use of `.unwrap()` on the result of some functions. As implemented, these APIs are guaranteed not to throw, but as a result the returned value must be transformed in some way to interact with it. Unwrapping a value essentially restores "default" Javascript behaviour and throw an exception if there was an error while performing the operation.

For more information on the parser API, see the [MVFParser](../classes/_mappedin_mvf-core.parser.MVFParser.html) docs.

### CMS Parser

For developers who have map data stored in Mappedin CMS, an additional parser preset is exposed to fit the format of that data.

```
import { createCMSMVFv3Parser, type CMSMVFv3 } from '@mappedin/mvf/preset-cms';
Copy
```

Otherwise, usage is the same as described above.

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-address.html
title: 
-->

## @mappedin/mvf-address

The address extension for MVF. Allows specifying an address for the entire bundle, as well as addresses for individual floor stacks.

An `Address` object is an object with keys representing different `type`s of address data, and values that contain the data in that format. As of right now, only one schema is supported: the `display` type. Addresses of the `display` type have a single `displayAddress` property, which is a formatted string that can be displayed directly to a user.

Future versions of this extension may add new types of structured address data, on new properties of the Address type.

Definition:

```
export type Address = {
   display?: {
      displayAddress?: string
   }
}

export type AddressExtension = {
   primary?: Address,
   floorStack?: Record<FloorStackId, Address>
}
Copy
```

Example:

```
{
  address: {
    primary: {
      display: {
        displayAddress: "5788 Wunsch Cliffs, Iristown, IA 75553"
      }
    },
    floorStack: {
      fs_0000001: {
        display: {
          displayAddress: "5788 Wunsch Cliffs, Iristown, IA 75553"
        }
      }
    }
  }
}
Copy
```

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-annotations.html
title: 
-->

## MVF Annotations

Annotations are very simple objects that point to where some item of interest exists at. For example, an MVF might have an Annotation where each Fire Extinguisher is.

There are a wide variety of types of Annotation, including those for building safety, (fire extinguishers, alarm panels, AEDs), security (cameras, smart locks, motion detectors), and parking (EV chargers, bike racks, visitor parking), etc. Typically an application would have an idea the types of annotations it wants to feature in some view, rather than attempting to just show them all at once.

Annotations are useful to place as markers on the map. More complex objects with more properties and more differences between instances are better modeled with something like [Locations](../modules/_mappedin_mvf-locations.html).

### Spec

The Annotations extension adds an `annotationSymbols` property, along with an `annotations` object, with a `<floorId>` key and array of [AnnotationProperties](../types/_mappedin_mvf-annotations.index.AnnotationProperties.html) objects per floor.

#### AnnotationSymbols

The `annotationSymbols` property contains an [AnnotationSymbol](../types/_mappedin_mvf-annotations.index.AnnotationSymbol.html) definitions for all the different types of annotations in this MVF. This is in the form of a single object containing a record of of symbol definitions, like this:

```
annotationSymbols: {
	Record<SymbolKey, {
		url: string,
		name: string
	}>
}
Copy
```

The `url` will be a link to an icon for the symbol, suitable for display in a marker. The `name` is something like "Electrical Panel" or "First Aid" suitable for display to the user.

[AnnotationProperties](../types/_mappedin_mvf-annotations.index.AnnotationProperties.html) are also very simple objects:

```
{
	id: AnnotationId,
	externalId: string,
	symbolKey: string
} & WithGeometryId
Copy
```

Since they are [WithGeometryId](../types/_mappedin_mvf-core.utility-types_geometry-id_geometry-id.WithGeometryId.html), they reference a single geometry on the floor their collection is for (which should be a Point). The `externalId` is a string that may be used to link the annotation to some other system external to Mappedin, and the `symbolKey` should be a key on the `annotationSymbols` object, to find the URL and name.

A developer can use the icon at the URL to show a marker anchored at the geometry, or can use the symbolKey to determine their own experience.

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-cms.html
title: 
-->

## MVF CMS Extension

The CMS Extension adds a number of properties to the MVF, all under the base `cms` property
This extra data is only available to certain CMS clients, and should not be used directly without
discussing the implications with your Mappedin representative.

In particular, everything in this extension is OPTIONAL, because much of it will eventually be promoted
to better, more standard MVF extensions, and deprecated out of this one. Others are only for use by the SDK.

If there is a piece of information available in the CMS Extension and another extension, USE THE
OTHER EXTENSION.

### Common Sub-Schemas

Most likely, if the CMS Extension is used, it will be for one of the following sub-schemas:

* [EnterpriseLocations](../types/_mappedin_mvf-cms.subSchemas_enterpriseLocations.EnterpriseLocationsSchema.html)
* [EnterpriseLocationInstance](../types/_mappedin_mvf-cms.subSchemas_enterpriseLocationInstance.EnterpriseLocationInstancesSchema.html)
* [EnterpriseVenue](../types/_mappedin_mvf-cms.subSchemas_enterpriseVenue.EnterpriseVenueSchema.html)
* [EnterpriseLayers](../types/_mappedin_mvf-cms.subSchemas_enterpriseLayers.EnterpriseLayersSchema.html)

#### Enterprise Venue

An Enterprise Venue adds extra enterprise data to the Enterprise Venue the MVF describes. The `slug` is the unique identifier for the venue.

```
type cms: {
	venue: {
		id: EnterpriseVenueId,
		slug: string,
		defaultLanguage: Language,
		languages: Language[],
		countrycode: string,
		logo: string,
		mappedinWebUrl: string,
		topLocations: EnterpriseLocationId[],
		operationHours: OpeningHoursSpecification[],
		coverImage: string,
	},
	& WithDetails(['name']),
	& WithExtra,
}
Copy
```

#### Enterprise Categories

[Enterprise Categories](../types/_mappedin_mvf-cms.subSchemas_enterpriseCategories.EnterpriseCategory.html) add extra data to an existing [LocationCategory](../types/_mappedin_mvf-locations.category.LocationCategory.html).

They MUST link to a [LocationCategory](../types/_mappedin_mvf-locations.category.LocationCategory.html) by `categoryId`, they do not replace them.

```
type cms: {
	categories: {
		id: EnterpriseCategoryId,
		categoryId: LocationCategoryId,
		color: string,
		sortOrder: number,
		iconFromDefaultList: string,
		picture: string,
	}[],
};
Copy
```

#### Enterprise Locations

[Enterprise Locations](../types/_mappedin_mvf-cms.subSchemas_enterpriseLocations.EnterpriseLocation.html) add extra enterprise data to an existing [Location](../types/_mappedin_mvf-locations.location.Location.html). They MUST link to a [Location](../types/_mappedin_mvf-locations.location.Location.html) by `locationId`, they do not replace them.

```
type cms: {
	locations: {
		id: EnterpriseLocationId,
		locationId: LocationId,
		type: string,
		sortOrder: number,
		tags: string[],
		picture: string,
		states: {
			start: string,
			end: string,
			type: LocationStateType,
		}[],
		siblingGroups: {
			label: string,
			siblings: LocationId[], // Note this links to the LocationId, not the EnterpriseLocationId.
		}[],
		gallery: { caption: string, image: string, embeddedUrl: string }[],
		showFloatingLabelWhenImagePresent: boolean,
		amenity: string,
		showLogo: boolean,
	}[],
};
Copy
```

#### Enterprise Layers

[Enterprise Layers](../types/_mappedin_mvf-cms.subSchemas_enterpriseLayers.EnterpriseLayersSchema.html) describe the logical/stlyistic "layer" that a geometry is on. It is a simple per floor mapping of [GeometryId](../types/_mappedin_mvf-core.identifiers.GeometryId.html) to layer name.

Typically, all geometries on the same layer will have the same overall visual style, though individual properties like altitude can be different.

The layer name can also be used to identify groups of geometries that are related in some way, for example to hide all geometries on the "Pillars" layer. There may or may not be a standard layer convention for a given venue or organization, but it is set and implemented by person making the map and not enforced by the system.

Enterprise Layers are similar in concept to "layers" in image editing software, except there is no visual order or hierarchy. Ie: The "Room" layer is neither above nor below the "Wall" layer. What will be visible is determined by the altitude and heights of the styles applied to the individual
geometries.

```
type cms: {
	layers: {
		f_1: {
			g_1: 'Floor',
			g_2: 'Floor',
			g_3: 'Wall
		}
	}
};
Copy
```

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-connections.html
title: 
-->

## MVF Connections

### Introduction

Connections are things like elevators, escalators, doors, and ramps. They are a way to represent special links a person can use to traverse between specific geometries, on the same floor or between floors. This is separate from the [Nodes extension](../modules/_mappedin_mvf-nodes.html), which describes how to walk through the walkable space on each floor. Connections act more like a vortex: They have one or more entry points a person can enter, and they can exit at any one of the exit points, with the normal cost being a static entry cost and an additional cost per floor transitioned.

This implies that Connections work best when they connect two points on the same floor, or any number of points stacked on different floors. A connection with several exits all over a single floor, or where exits on other floors are spread out, will be difficult to cost correctly.

### Specification

#### Connection

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

#### Entrances and Exits

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

#### Connection Type

A connection type is a string that describes the type of connection. It is a SafeStringEnum that SHOULD be one of the following: `elevator`, `escalator`, `door`, `ramp`, `stairs`, `travelator`, `ladder`, or `unknown`.

`unknown` is a special type that is not normally used directly. It is NOT considered a breaking change for an MVF to contain new types that are not present in this list.

Libraries that parse or create an MVF bundle MUST downgrade any types not present in the version of the specification they are targeting to `unknown`. The Mappedin MVF library will perform this downgrade automatically via the SafeStringEnum parser. Any other parser must handle this downgrade itself.

Applications that consume MVFs MUST continue to provide wayfinding with unknown connection types present.

For example, some future version of the spec add a `slide` connection type. Applications producing MVFs may then create a Slide tool. Users may create new Slides on existing maps, or convert incorrectly modeled "Ramps" into Slides. At that point, new MVFs will be produced for that venue which will contain `slide` type Connections. An SDK consuming that MVF MUST ensure `slide` connections are downgraded to `unknown`. A existing in market application using that SDK may then start seeing `unknown` type connections. A user of that app must not have broken experience, even if the app does not, eg, have a Slide icon in their UI.

#### Line String Doors with Nodes

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

### Navigation Cost

When wayfinding through a connection, the cost is the sum of the `entryCost` and the `floorCostMultiplier` times the absolute difference in elevation of the entry and exit floors. This value is then considered as the cost in meters to traverse the connection, and can be thought of as how far out of their way a person should walk to avoid that particular connection in favour of a cheaper option.

#### A\* Considerations

The `entryCost` of a connection that enters and exits on the same floor is the ONLY cost paid to use it. It must be greater than or equal to 0, but it MAY be less than the straight line distance between the entrance and exit points.

This matters because when wayfinding using the [A\* algorithm](https://en.wikipedia.org/wiki/A%2A_search_algorithm.html), one typically uses the straight line distance from a node to the goal node as the heuristic. However, to be `admissable` according to A\*, the heuristic cannot underestimate the actual cost. Any connection who's `entryCost` is less than the distance between the entrance and exit points will break this assumption. `Travelators` are a good [example](#travelator) of this, but poorly costed `doors` or any `unknown` type connections can also break this assumption.

For this reason, when wayfinding using same-floor Connections, a different approach must be used. Failure to do so will still produce a valid path, but it may not be optimal.

#### Examples

##### Stairs and Elevator

Consider a user at point A on floor 1. They would like to get to point B on floor 4. There exists a set of stairs that connects the two floors, with an entrance 1 meter away from A, and an exit 1 meter away from B. The stairs have an `entryCost` of 0, since a person can just walk on without waiting and a `floorCostMultiplier` of 10. The cost to traverse the stairs is then 0 + 10 \* (4 - 1) = 30 meters. Therefore the total path cost to get from A to B via the stairs is 32 meters.

Consider that there is also an elevator that connects the two floors. It has an `entryCost` of 10, since a person may have to wait for it to arrive. The elevator has a `floorCostMultiplier` of 1, since once a person is on the elevator it's very easy to traverse between floors. The cost to traverse the elevator is then 10 + 1 \* (4 - 1) = 13 meters.

The difference between the stairs path (32) and the cost of the elevator (13) is 19 meters. This means that it would be worth it for the person to walk up to 19 additional meters out of their way to get to and from the elevator, to avoid taking the stairs.

##### Travelator

Consider a user at point A on floor 1. They would like to get to point B on floor 1. The path cost through the node graph from A to B is 10 (meaning the distance walked is 10 meters, if there are no weights in the node graph).

There exists a travelator (ie, people mover, moving sidewalk, etc) that starts at point C and exits and point D. It is 1 meter from A to C, and 1 meter from B to D. The distance the travelator covers, B to D, is 10 meters. Since the travelator is faster than walking, it's `entryCost` should be set with regard to how much faster it is. If it's twice as fast the `entryCost` should be 5 meters. This means the cost to get from A to B via the travelator is 10 + 5 = 15 meters, less than the 20 meters of walking.

NOTE: The distance between the entrance and exit point (C and D in this case) is NOT a factor in the cost, though it may have been used to calculate the entry cost. Also note, this breaks admissibility the typical A\* heuristic. See [A\* Considerations](#a-considerations) for more details.

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-core.html
title: 
-->

## MVF Core

The `mvf-core` package contains the fundamental "extensions" of the MVF format. They are technically optional, but practically every MVF will contain:

* The [Manifest](../types/_mappedin_mvf-core.core_manifest_manifest.ManifestSchema.html) extension
* The [Floors](../types/_mappedin_mvf-core.core_floors_floors.FloorsSchema.html) extension
* The [Geometry](../types/_mappedin_mvf-core.core_geometry_geometry.GeometrySchema.html) extension.

This document contains an overall summary of these extensions, but see the pages linked above for more details.

There are also a number of [utility types](../modules/_mappedin_mvf-core.utility-types.html) used by other extensions, as well as a set of RFC-7946 compliant [GeoJSON](../modules/_mappedin_mvf-core.core_geojson-1.html) types

### Structure

An MVF is a package of files and folders that can be parsed with one or more MVF Extension parsers. Typically, the package is shipped as a compressed file, but it would also be correct to host the files on a webserver with paths relative to the Manifest.

The MVF package will parse a compressed MVF file with the extensions specified, and, if it valid according to the extensions, return a JavaScript object of the contents, organized with objects for folders and files (without extension) as properties. For example, a basic MVF containing the three core extensions may look like this:

```
geometry/
	abcde1234.geojson
	abcde1235.geojson
floors.geojson
manifest.geojson
Copy
```

When parsed with a parser configured for the core extensions, it will produce an object like this:

```
{
	geometry: {
		abcde1234: 	{ // GeometryFeatureCollection },
		abcde1235: 	{ // GeometryFeatureCollection }
	},
	floors: 		{ // FloorsFeatureCollection }
	manifest: 		{ // ManifestFeatureCollection }
}
Copy
```

If there were additional extensions present, they would NOT be included in the resulting object. A parser will only get the extensions the application is prepared to use.

Of special note is the `geometry` extension. The property IDs/file names are `floorIds`, which should exist in `floors.geojson`. This means that the geometry in those files are
on that floor. This is a common pattern used by many extensions. If it is safe to break data up by floor, it should be done. This will allow partial parsing and faster load times in future versions.

### Manifest

The [Manifest](../types/_mappedin_mvf-core.core_manifest_manifest.ManifestSchema.html) extension includes a single file, `manifest.geojson`. It contains the file structure of the MVF, as well as some data that describes the place the bundle as a whole represents. For example, a name, a default map, a language the data is in.

### Floors

The [Floors](../types/_mappedin_mvf-core.core_floors_floors.FloorsSchema.html) extension includes a single file, `floors.geojson`, that is a FeatureCollection of Floor features. These are all of the floors/levels in the MVF. Many extensions will break data into a separate file per floor. The floor features themselves will contain data like the name and elevation of the floor, but grouping the floors into logical units like Buildings are handled by other extensions, like [Floor Stacks](../modules/_mappedin_mvf-floor-stacks.html)

### Geometry

The [Geometry](../types/_mappedin_mvf-core.core_geometry_geometry.GeometrySchema.html) extension includes a `geometry` folder with a single geojson file per floorId. This will be a `FeatureCollection` containing ALL geometry for that floor. That includes lines describing the shape of rooms and doors, polygons describing the shape of desks and areas, and points marking where safety annotations are. The Geometry itself does not contain a reference to those higher level concepts however, they only represent geometry where something interesting, typically referenced by at least one other extension, is.

Geometry features implement the [WithDetails](../types/_mappedin_mvf-core.utility-types_details_details.WithDetails.html) utility type on their properties, meaning they MAY have some very basic metadata available about them. Most common is an `externalId` that may represent something like a room / unit number.

For common extensions that reference geometries, please see: [Locations](../modules/_mappedin_mvf-locations.html), [Connections](../modules/_mappedin_mvf-connections.html), [Default Style](../modules/_mappedin_mvf-default-style.html), and [Kinds](../modules/_mappedin_mvf-kinds.html).

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-default-style.html
title: 
-->

The default style extension for an MVF. This describes things like the color, height and opacity that should be applied to Geometry.

Not every geometry will have a default style, and if it does not, it should not be rendered.

## MVF Default Style

The default style extension for an MVF. A [DefaultStyle](../types/_mappedin_mvf-default-style.DefaultStyle.html) has things like color, height and opacity and the geometry it should be applied to. It is geared towards rendering the MVF in a 3D mapping engine, but specific properties like color may be useful in other contexts.

If a geometry is NOT referenced by a style, or some other style-like extension, it should generally NOT be rendered by default.

In particular, it is expected that Geometry of [kind](../modules/_mappedin_mvf-kinds.html) area will not get a default style, but there may be other cases.

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-entrance-aesthetic.html
title: 
-->

## MVF Entrance Aesthetic

The Entrance Aesthetic extension describes aesthetic elements of doors, such as their swing direction and whether they are single or double doors.

This is purely for informational / rendering purposes, and does NOT impact wayfinding. For the direction doors can be walked through, see the [Connections](../modules/_mappedin_mvf-connections.html) and [Nodes](../modules/_mappedin_mvf-nodes.html) extensions.

The line string geometry an entrance aesthetic is associated with should be the entrance line string of the door Connection, if that extension is present.

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-facade.html
title: 
-->

## MVF Facade

The Facade extension describes the [Geometry](../types/_mappedin_mvf-core.core_geometry_geometry.GeometrySchema.html) of a [FloorStack](../modules/_mappedin_mvf-floor-stacks.html) that live on [Floors](../types/_mappedin_mvf-core.core_floors_floors.FloorsSchema.html) not part of the stack. For example (and typically), the [Outdoors](../modules/_mappedin_mvf-outdoors.html) floor may have one or more polygons that represent the facade of a building, which is grouped into a single FloorStack with it's inner floors.

This is separate from the geometry of the `Floors`, which will usually be the exterior walls only. The `facade` may include extra geometry, such as a representation of the roof. As they are normal `Geometry` objects, the `facade` may get things like [styles](../modules/_mappedin_mvf-default-style.html), [floor images](../modules/_mappedin_mvf-floor-images.html), or even a [Location](../modules/_mappedin_mvf-locations.html) describing the building as a whole attached to it.

### Schema

The facade extension adds a `facade` property to the MVF, which is a record of [FloorStackId](../types/_mappedin_mvf-floor-stacks.index.FloorStackId.html) to [FacadeProperties](../types/_mappedin_mvf-facade.index.FacadeProperties.html).

#### FacadeProperties

FacadeProperties are [WithGeometryAnchors](../types/_mappedin_mvf-core.utility-types_geometry-anchor_geometry-anchor.WithGeometryAnchors.html) objects, with at least one anchor, plus a `id` property that is a [FacadeId](../types/_mappedin_mvf-facade.index.FacadeId.html).

A facade may include anchors on multiple floors, if, for some reason, it has representation on them, but typically they will be on the [Outdoors](../modules/_mappedin_mvf-outdoors.html) floor.

#### FacadeIntegrityError

FacadeIntegrityError is a simple object with a single property, `id`, which is the [FloorStackId](../types/_mappedin_mvf-floor-stacks.index.FloorStackId.html) of the facade.

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-floor-images.html
title: 
-->

The floor images extension for an MVF. This extension allows for the addition of images to a floor,
either anchored to a geometry or floating in space.

The Mappedin SDK handles this for you, as an SDK user you are unlikely to need to use this extension directly.

## MVF Floor Images

The floor images extension for an MVF allows for the addition of images to a floor, either anchored to a geometry or floating in space.

It adds a floorImages property, with a feature collection of points with FloorImageProperties per floor.

The Mappedin SDK handles this, an SDK user is unlikely to need to use this extension directly.

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-floor-stacks.html
title: 
-->

## MVF Floor Stacks

The Floor Stacks extension describes groups, or stacks, of floors. The are typically used to represent buildings, but this is not a requirement.

A floor can appear in multiple floor stacks, or none. It may NOT appear in the same floor stack twice.

If there is an `outdoors` floor, that information can be found in the [Outdoors](../modules/_mappedin_mvf-outdoors.html) extension, not here.

### Schema

The Floor Stacks extension adds a `floorStacks` property to the MVF, which is an array of [FloorStack](../types/_mappedin_mvf-floor-stacks.index.FloorStack.html) objects.

#### FloorStack

FloorStack are an array of [FloorId](../types/_mappedin_mvf-core.core_identifiers_identifiers.FloorId.html)s. They may optionally have a `defaultFloor`, and a [Details](../types/_mappedin_mvf-core.utility-types_details_details.Details.html) object.

If the `FloorStack` does not have a `defaultFloor`, it is up to the consumer of the MVF to decide which floor is used as the default. Generally, a safe choice is the floor with elevation ordinal closest to 0.

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-kinds.html
title: 
-->

## MVF Kinds

The Kinds extension provides a high level categorization of geometry in an MVF. A geometry can have only ONE kind, from the [KIND](../variables/_mappedin_mvf-kinds.KIND.html) enum. Examples include `room`, `hallway`, `wall`, and `area`.

Note that this is a [SafeStringEnum](../functions/_mappedin_mvf-core.utility-types_safe-enum_safe-enum.SafeStringEnumSchema.html), so `unknown` is a valid value. New kinds will likely be added in the future, and if the version of the MVF package being used does not support it, it will be downgraded to `unknown` automatically.

When consuming an MVF directly without this package, the downgrade will need to be handled by the application. An application may ignore the `unknown` kind, or have some generic behavior, but it must not crash or throw errors.

### Schema

The Kinds extension adds a `kinds` property to the MVF, which is a record of [FloorId](../types/_mappedin_mvf-core.core_identifiers_identifiers.FloorId.html) to [GeometryKinds](../types/_mappedin_mvf-kinds.GeometryKinds.html) objects.

GeometryKinds are records of [GeometryId](../types/_mappedin_mvf-core.core_identifiers_identifiers.GeometryId.html) to [Kind](../types/_mappedin_mvf-kinds.Kind.html) objects.

### Example

```
{
	"kinds": {
		"f_000001": {
			"g_000001": "room",
			"g_000002": "hallway"
		}
	}
}
Copy
```

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-locations.html
title: 
-->

## MVF Locations

The Locations extension adds a way to create Location/PoI metadata associated with one or more geometries. So where a specific Polygon might be `unit 123`, a Location might be attached to that Polygon, another an the floor above, and called "Macy's", with a description, photos and links to it's social media accounts.

A geometry can have multiple locations (including 0), and a location can have multiple geometries.

The locations extension adds three properties to the root of the MVF, corresponding to the three files:

* `locations`, for the `locations.json` file
* `locationCategories`, for the `location-categories.json` file
* `locationInstances`, for the `location-instances.json` file

### Schema

#### Location

A Location is a place of interest in the MVF that end users may want to know about.

It will always have a `details` property with at least a `name`. It will also have
`geometryAnchors`, which will have 0 or more Geometries this location is attached to.

Many locations will only have one anchor, but it is common to have things like Washrooms be a
single location with many different anchors. Also if a location is spread across floors it may
have multiple anchors.

Locations may also have `locationCategories`, which are used to group locations together.

In cases where locations are attached to multiple geometries, there may also be `locationInstances`
for that location, where the properties specific to that instance are noted. For example, a location instance
may have different hours.

#### LocationCategory

A LocationCategory is a category Locations may belong to. It may have a parent category, and will otherwise have a standard `details` property with at least a `name`.

#### LocationInstance

A LocationInstance is a particular instance of an location (usually one that is attached to multiple geometries) that has some properties different from the parent. Eg, it may have different hours, or a slightly different name.

A LocationInstance:

* MUST have a parentId, referring to a Location.
* MUST have a unique ID, for localization to work.
* SHOULD have AT LEAST ONE polygon or node to anchor it in space.
* SHOULD have AT LEAST ONE other Location property set.

It is otherwise a `Partial<Location>`

#### Example

```
{
	"locations": [
		{
			"id": "loc_00001",

			"geometryAnchors": ["g_00001"],
			"locationCategories": ["lcat_00001"],
			"details": {
				"name": "Mappedin",
				"description": "Your new way to map",
			},
			"logo": "https://www.mappedin.com/logo.png",
			"website": {
				"label": "Mappedin",
				"url": "https://mappedin.com"
			},
			"links": [
				{
					"label": "Get started free",
					"url": "https://app.mappedin.com/"
				},
				{
					"label": "Work for us",
					"url": "https://mappedin.com/careers"
				}
			],
			"social": [
				{
					"name": "LinkedIn",
					"url": "https://www.linkedin.com/company/mappedin"
				},
			],
			"geometryAnchors": [
				{
					"geometryId": "g_00001",
					"floorId": "f_00001"
				}
			],
		}
	],
	"locationCategories": [
		{
			"id": "lcat_00001",
			"details": {
				"name": "Technology"
			}
		}
	]
}
Copy
```

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-navigation-flags.html
title: 
-->

## MVF Navigation Flags

### 1. Introduction

Navigation flags provide a mechanism to describe the properties of navigation paths within an MVF. They enable consumers of MVF data to make intelligent routing decisions based on the qualities of different paths. For example, an application might use flags to:

* Find routes that are wheelchair accessible
* Avoid outdoor areas when it's raining
* Only show paths that are open to the public
* Include VIP-only areas for authorized users

These flags can be applied to any wayfinding component in other extensions, including but not limited to [Connections](../modules/_mappedin_mvf-connections.html) and [Nodes](../modules/_mappedin_mvf-nodes.html)

## 2. Types

#### 2.1 Navigation Flags Declarations

At the root of the MVF will be a `navigationFlagsDelcarations` property.

The NavigationFlagsDeclarations file contains a map of all navigation flag declarations for an MVF. For an MVF to be considered valid, all navigation flags used in any extensions MUST be declared in this file.

The key of the map is a unique, durable string identifier for the flag that developers use when interacting with the flag through an SDK. This will typically be something meaningful like `accessible` or `indoors`. The value will be a [NavigationFlagDeclaration](../types/_mappedin_mvf-navigation-flags.index.NavigationFlagDeclaration.html) object that describes the flag (in particular, the `index` and `bit` values used to check for the flag in a `flags` array).

#### 2.2 Navigation Flag Declaration

A navigation flag declaration defines a single navigation property. Each declaration MUST include:

* `index`: The non-durable index of the flag the 32-bit integer in the `flags` array, provided by the `Flags` type. `index` MUST be sequential, starting at 0, and increasing by 1 for every 32 flag definitions.
* `bit`: The non-durable bit position (0-31) that will be set in the `flags` integer at the index specified by `index` used by other extensions to indicate the presence of this flag. `bit` MUST be sequential, starting at 0, and increasing by 1 for each new flag in the same `index`.

The combination of `index` and `bit` MUST be unique across all navigation flag declarations in the same MVF.

A declaration MAY also include:

* `details`: A [Details](../types/_mappedin_mvf-core.utility-types_details_details.Details.html) object that can provide additional information. This is usually a name, but may include other information such as description, images, and links. Like all details, it is targeted towards users, not developers.

#### 2.3 Flags Type

This extension defines a reusable [Flags](../types/_mappedin_mvf-navigation-flags.index.Flags.html) type that can be incorporated into any other type to make it navigation flag aware:

```
type Flags = {
 /**
  * An array of 32-bit integers representing the navigation flags. Each bit on an integer corresponds to a flag
  * in the NavigationFlagDeclarations, as determined by its index and bit position.
  */
 flags: number[];
};
Copy
```

For convenience, this extension also defines a [FlaggedGeometryAnchor](../types/_mappedin_mvf-navigation-flags.index.FlaggedGeometryAnchor.html) type that combines the core `GeometryAnchor` type with the `Flags` type:

```
type FlaggedGeometryAnchor = GeometryAnchor & Flags;
Copy
```

There are also the [WithFlags](../types/_mappedin_mvf-navigation-flags.index.WithFlags.html), [WithFlaggedGeometryAnchor](../types/_mappedin_mvf-navigation-flags.index.WithFlaggedGeometryAnchor.html), and [WithFlaggedGeometryAnchors](../types/_mappedin_mvf-navigation-flags.index.WithFlaggedGeometryAnchors.html) types that can be added to objects by other extensions to make them navigation flag aware.

#### 2.4 Using Navigation Flags

Extensions that support navigation flags SHOULD either include the `Flags` type in their own types, or use the `FlaggedGeometryAnchor` type for their anchors, which include the `flags` property. `flags` is an array of 32-bit integers, where each bit of each integer corresponds to a specific navigation flag. The presence of a flag is indicated by setting the corresponding bit to 1.

For example, if the NavigationFlagsDeclarations file contains:

```
{
 "accessible": {
  "index": 0,
  "bit": 0
 },
 "public": {
  "index": 0,
  "bit": 1
 },
 "indoors": {
  "index": 0,
  "bit": 2
 }
}
Copy
```

Then a `flags` value of `[6]` can be broken down as follows:

* `accessible` flag (index 0, bit 0): 2^0 = 1 (not set)
* `public` flag (index 0, bit 1): 2^1 = 2
* `indoors` flag (index 0, bit 2): 2^2 = 4

The total value is 0 + 2 + 4 = 6, indicating that both `indoors` and `public` flags are enabled, while `accessible` is disabled.

When a consumer of MVF data wants to find a path with specific flags, they can check that each component along the path has the required flags set or not, and use it to change the weight or block that part of the path entirely.

### 3. Well Known Flags

Certain flags have well known meanings and should be used where possible in preference of custom flags. Applications SHOULD provide first class wayfinding support for Well Known Flags. They MAY provide support for custom flags.

A given MVF DOES NOT need to include all well known flags, only the ones it is using.

For well known flags, only the `key` (and meaning) is durable. The `index` and `bit` values are not guaranteed to be the same across different MVFs. Consumers of MVFs MUST NOT crash if a Well Known Flag is not present in the NavigationFlagsDeclarations.

```
/**
 * All well known navigation flags.
 */
export const WELL_KNOWN_FLAGS = {
 accessible: 'accessible',
 outdoors: 'outdoors',
 public: 'public'
} as const;
Copy
```

#### 3.1 Accessible

The `accessible` flag indicates that a navigation component is designed to be accessible to people using mobility aids such as wheelchairs. This includes appropriate width for doorways, paths taking ramps instead of stairs, and elevators instead of escalators.

#### 3.2 Outdoors

The `outdoors` flag indicates that a navigation component is or goes outside.

#### 3.3 Public

The `public` flag indicates that something is navigable by the public users of the building or space. By default, consumers of MVF should not route through non-public things when the public flag is present.

### 4. File Structure

The navigation flags extension adds a single file to the MVF bundle:

```
map-bundle/
âââ navigationFlags.json
Copy
```

The navigationFlags.json file contains an array of NavigationFlagDeclaration objects.

### 5. Implementation Guidelines

#### 5.1 Checking for Flags

To check if a specific flag is set on a [WithFlags](../types/_mappedin_mvf-navigation-flags.index.WithFlags.html) object, use the [hasFlag](../functions/_mappedin_mvf-navigation-flags.utils.hasFlag.html) function.

It performs the appropriate bitwise AND and looks something like this:

```
// Assuming flagKey is the key of the flag to check,
// flagBit is its bit position from NavigationFlagsDeclarations,
// and entityFlags is the flags value from an entity
function hasFlag(entityFlags: number[], flagIndex: number, flagBit: number): boolean {
 return (entityFlags[flagIndex] & (1 << flagBit)) !== 0;
}
Copy
```

#### 5.2 Setting Flags

When constructing an MVF, a developer can set flags on a flaggable object using a bitwise OR operation:

```
// To set a flag with bit position flagBit on an entity with existing flags
function setFlag(entityFlagBitfield: number, flagBit: number): number {
 return entityFlagBitfield | (1 << flagBit);
}
Copy
```

#### 5.3 Making Types Navigation Flag Aware

Extensions that have made their objects navigation flag aware will have either added the WithFlags type:

```
import { Flags } from "./navigationFlags";
// An example type in another extension
export type Node = {
 id: string;
 position: [number, number];
 // Other properties...
} & WithFlags; // This adds the flags property
Copy
```

Or used the `FlaggedGeometryAnchor` type for their geometryAnchor(s).

```
import { FlaggedGeometryAnchor } from "./navigationFlags";
// An example type in another extension
export type Connection = {
    id: string;
 entrances: FlaggedGeometryAnchor[];
 exits: FlaggedGeometryAnchor[];
 // Other properties...
}
Copy
```

This pattern allows any extension to incorporate navigation flags in a consistent way.

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-nodes.html
title: 
-->

## MVF Nodes

### 1. Introduction

Nodes describe paths a person can walk around on in an MVF. There is a single file of nodes per floor, and those files will describe how to walk around on that floor. Going from one floor to another, or through things like travelators or doors, are done by [Connections](../modules/_mappedin_mvf-connections.html).

Nodes also make use of the [NavigationFlags](../modules/_mappedin_mvf-navigation-flags.html) extension to indicate under what situations a node's edge may be used. For example, if a user
is in a wheelchair, they can cross edges that have the Well Known `accessible` flag set.

Nodes link back to other extensions through shared geometry. For example, to navigate to a specific [Location](../modules/_mappedin_mvf-locations.html), that location must have a `GeometryAnchor` that is also referenced as one of the `geometryIds` of a node on that floor.

For developers using the MappedIn SDKs, nodes are typically not interacted with directly.

### 2. Specification

#### 2.1 Node

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

#### 2.2 Nodes Collection

Data will be organized by floor ID, and will be a FeatureCollection of nodes.

### 3. File Structure

Node data will be stored as follows:

```
nodes/
âââ f_abcd1234.geojson
âââ f_defg5678.geojson
âââ f_hijk9012.geojson
Copy
```

Where `f_abcd1234`, `f_defg5678` and `f_hijk9012` are valid floor IDs.

### Example

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

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-outdoors.html
title: 
-->

## MVF Outdoors

The MVF Outdoors extension is used to describe which floors are outdoors in an MVF.

It adds a single property to the root of the bundle, `outdoors`, which contains a unique array of [FloorId](../types/_mappedin_mvf-core.core_identifiers_identifiers.FloorId.html)s. These floors are considered "outdoors" and may be treated specially by applications, such as always showing them on the map. Typically, there will only be one floor in an MVF that is outdoors, but there may be more at complex venues like airpots.

A floorId CANNOT be part of both `outdoors` and a [FloorStack](../modules/_mappedin_mvf-floor-stacks.html).

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-tileset.html
title: 
-->

## MVF Tileset

The Tileset extension provides a way to define the outdoor tileset to use when rendering an MVF. It is largely use by the SDK, and will not typically be needed by a developer.

### Schema

The Tileset extension adds a single property to the root of the bundle, `tileset`, which is a [TilesetCollection](../types/_mappedin_mvf-tileset.index.TilesetCollection.html) object.

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_mvf-traversability.html
title: 
-->

## MVF Traversability

The Traversability extension provides a way to define which geometries can be walked on/through, and which cannot. It is primarily used to influence the automatic node generation process.

### Schema

The Traversability extension adds two properties to the root of the bundle, `walkable` and `nonwalkable`, which are Records of [FloorId](../types/_mappedin_mvf-core.core_identifiers_identifiers.FloorId.html) to [WalkableGeometries](../types/_mappedin_mvf-traversability.index.WalkableGeometries.html) and [NonWalkableGeometries](../types/_mappedin_mvf-traversability.index.NonWalkableGeometries.html) objects.

If a geometry id is present in a walkable record, it can be walked over. If it is present in a nonwalkable record, it will block walking. If it is both, nodes may be generated to walk up to it, but not through it. If it is in neither, it will be ignored for the purposes of node generation.

---
<!--
URL: https://docs.mappedin.com/mvf/v3/latest/modules/_mappedin_safe-types.html
title: 
-->

## Safe Types

Safe Types is a package that uses the type system to force developers to make
decisions around errors and understand the consequences. These are primarily
based on Rust's error-handling system, but other langauges exist that do
error handling with a monad like this, like Haskell, OCaml, or Kotlin.

For developers seeing this for the first time, here is a quick overview.

### Overview

Essentially, the goal is that every time there is a fallible function, it should
to return a `Result<T, E>`, where `T` is the type of the data when everything
has run successfully, and `E` is the error type. These can be basically anything.

Say there is some function to add two arbitrary numbers. It needs to handle the case
when the number exceeds the 32-bit unsigned integer range. Writingthis the "normal"
Javascript way, it might look like this:

```
const checkedAdd = (a: number, b: number): number => {
	const sum = a + b;
	if (sum > 2 ** 32 - 1) {
		throw new Error(`${a} and ${b} exceed the 32-bit unsigned int limit`);
	}
	return sum;
};
Copy
```

The problem here is that the error isn't easily discoverable. It, could be documented,
but it doesn't actually enforce handling the error either:

```
const downstream = () => {
	const result = checkedAdd(2 ** 32 - 5, 5);
	// TS doesn't actually force handling this error, even if the function
	// is documented to say that it can throw.
};
Copy
```

With the `Result` type, it could be rewritten as:

```
const checkedAddSafe = (a: number, b: number): Result<number, string> => {
	const sum = a + b;
	if (sum > 2 ** 32 - 1) {
		return err(`${a} and ${b} exceed the 32-bit unsigned int limit`);
	}
	return ok(sum);
};
Copy
```

`err` and `ok` are functions that construct a "success" and "failure" result.
Downstream, anyone using this function is required to do something with it:

```
const downstream = () => {
	const result = checkedAddSafe(2 ** 32 - 5, 5);

	// I'm left with a Result that I have to check to be able to use the interior
	// value.

	if (result.isOk()) {
		console.log(result.value);
	}

	if (result.isErr()) {
		console.error(result.error);
	}
};
Copy
```

When interfacing with result-based code, to "fall back"
to traditional Javascript exception handling, call
`.unwrap()` on a result. Note this should be considered
unsafe and rarely used unless necessary.

### Safety Wrapping

It's inevitable that a developer will have to interact with code they don't own,
and it may not be possible to know whether or not it may throw an exception. For
this, use either `safeFn` or `safeAsyncFn` to create safe versions of these functions.

These are essentially a try-catch around the original function that converts any
caught errors into the error component of the Result type.

### Convenience Methods

It can sometimes feel awkward to work with results like this, but there are some
ways to make this easier to work with. Consider these trivial functions:

```
const fallible = (value: boolean): Result<number, string> => {
	if (value) {
		return ok(5);
	} else {
		return err('...');
	}
};

const lessThan5 = (value: number): Result<string, string> => {
	if (value < 5) {
		return ok('yep');
	} else {
		return ok('nope');
	}
};
Copy
```

* If an action is fallible, but there is some reasonable default or fallback
  value that can be used in case of an error, use `.unwrapOr(fallback)`.

  ```
  const valueT = fallible(true).unwrapOr(10); // valueT = 5;
  const valueF = fallible(false).unwrapOr(10); // valueF = 10;
  Copy
  ```
* To modify the interior value of a result, use `.map(fn)`.
  The function will *only* apply if the result was "good", and won't be used if
  there was an error.

  ```
  const valueT = fallible(true).map((n) => n * 2); // value = ok(10);
  const valueF = fallible(false).map((n) => n * 2); // value = err('...');
  Copy
  ```
* To modify the error contained in a result, use `.mapErr(fn)`.
  The function will *only* apply if the result was "bad", and won't be used if
  there was a good value.

  ```
  const valueT = fallible(true).mapErr(() => 'new'); // value = ok(5);
  const valueF = fallible(false).mapErr(() => 'new'); // value = err('new');
  Copy
  ```
* To perform a fallible action based on the "good" value of a result,
  use `.andThen(fn)`. This function should return a new Result with an
  error type that matches the existing one.

  ```
  const andResult = ok(1).andThen((v) => lessThan5(v)); // value = ok('yep');
  const valueT = fallible(true).andThen((v) => lessThan5(v)); // value = err('nope');
  const valueF = fallible(false).andThen((v) => lessThan5(v)); // value = err('...');
  Copy
  ```

These can be chained for a given result as well.

There are also some "top-level" utility functions for common scenarios:

* `isOk(result)` and `isErr(result)` are very handy for filtering lists.
  i.e. If you have an array of results, you can get only the succesful
  ones (or unsuccessful ones).
* `flatten()` can reduce an array of results into a single result where the
  "good" value is an array. If an error is present in the array, the error of
  the returned value will be the first one encountered.

  ```
  const results = [ok(1), ok(2), ok(3)];
  const flat = flatten(results); // flat = ok([1, 2, 3]);

  const resultsBad = [ok(1), ok(2), err(3), err(4), ok(5)];
  const flatBad = flatten(resultsBad); // flatBad = err(3);
  Copy
  ```
* `reduce()` can reduce a nested result by one stage, as long as both share an
  error type.

  ```
  const result = ok(ok(1));
  const reduced = reduce(result); // reduced = ok(1);

  const resultBad = err(1);
  const reducedBad = reduce(resultBad); // reducedBad = err(1);

  const resultNestedBad = ok(err(1));
  const reducedNested = reduce(resultNestedBad); // reducedNested = err(1);
  Copy
  ```

  However in most cases, `.andThen(r => r)` should be used if applicable.

### Method Chaining

Suppose there are a bunch of functions that return `Result`s,
and they should be combined into a single function. The methods `chain` and
`chainOk` are exposed to support this.

* `chain` takes a list of functions, where each function returns a `Result` type
  of some kind. The first function takes an arbitrary list of arguments, but
  subsequent functions are expected to take the result of the previous function.
  Regardless of the result of previous functions, all functions in the chain
  will be called.

  ```
  const manyFn = chain(
  	(x: number) => (x > 0 ? ok(x * 5) : err('1')),
  	(y: Result<number, string>) => y.map((x) => x * 10).mapErr('2'),
  	(z: Result<number, string>) =>
  		z.map((x) => `Result: ${x}`).mapErr(new Error('hi'))
  );

  const resultA = manyFn(1); // ok("Result: 50");
  const resultB = manyFn(0); // err(new Error("hi"));
  Copy
  ```
* `chainOk` works similarly to `chain`, except that subsequent functions should
  accept the type of the `Ok` variant of the result, rather than the result
  itself, of the previous function. This will also short-circuit, so later parts
  of the chain are not called if an error occurs earlier.

  ```
  const manyFn = chainOk(
  	(x: number) => (x > 0 ? ok(x * 5) : err('1')),
  	(y: number) => (y > 10 ? ok(y * 10) : err('2')),
  	(z: number) => (z > 150 ? ok(z * 2) : err('3'))
  );

  const resultA = manyFn(0); // err('1');
  const resultB = manyFn(1); // err('2');
  const resultC = manyFn(2); // err('3');
  const resultD = manyFn(4); // ok(400);
  Copy
  ```

---