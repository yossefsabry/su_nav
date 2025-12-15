# MVF Core

The `mvf-core` package contains the fundamental "extensions" of the MVF format. They are technically optional, but practically every MVF will contain:

* The [Manifest](../types/_mappedin_mvf-core.core_manifest_manifest.ManifestSchema.html) extension
* The [Floors](../types/_mappedin_mvf-core.core_floors_floors.FloorsSchema.html) extension
* The [Geometry](../types/_mappedin_mvf-core.core_geometry_geometry.GeometrySchema.html) extension.

This document contains an overall summary of these extensions, but see the pages linked above for more details.

There are also a number of [utility types](../modules/_mappedin_mvf-core.utility-types.html) used by other extensions, as well as a set of RFC-7946 compliant [GeoJSON](../modules/_mappedin_mvf-core.core_geojson-1.html) types

## Structure

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

## Manifest

The [Manifest](../types/_mappedin_mvf-core.core_manifest_manifest.ManifestSchema.html) extension includes a single file, `manifest.geojson`. It contains the file structure of the MVF, as well as some data that describes the place the bundle as a whole represents. For example, a name, a default map, a language the data is in.

## Floors

The [Floors](../types/_mappedin_mvf-core.core_floors_floors.FloorsSchema.html) extension includes a single file, `floors.geojson`, that is a FeatureCollection of Floor features. These are all of the floors/levels in the MVF. Many extensions will break data into a separate file per floor. The floor features themselves will contain data like the name and elevation of the floor, but grouping the floors into logical units like Buildings are handled by other extensions, like [Floor Stacks](../modules/_mappedin_mvf-floor-stacks.html)

## Geometry

The [Geometry](../types/_mappedin_mvf-core.core_geometry_geometry.GeometrySchema.html) extension includes a `geometry` folder with a single geojson file per floorId. This will be a `FeatureCollection` containing ALL geometry for that floor. That includes lines describing the shape of rooms and doors, polygons describing the shape of desks and areas, and points marking where safety annotations are. The Geometry itself does not contain a reference to those higher level concepts however, they only represent geometry where something interesting, typically referenced by at least one other extension, is.

Geometry features implement the [WithDetails](../types/_mappedin_mvf-core.utility-types_details_details.WithDetails.html) utility type on their properties, meaning they MAY have some very basic metadata available about them. Most common is an `externalId` that may represent something like a room / unit number.

For common extensions that reference geometries, please see: [Locations](../modules/_mappedin_mvf-locations.html), [Connections](../modules/_mappedin_mvf-connections.html), [Default Style](../modules/_mappedin_mvf-default-style.html), and [Kinds](../modules/_mappedin_mvf-kinds.html).