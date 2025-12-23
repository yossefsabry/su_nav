# MVF Annotations

Annotations are very simple objects that point to where some item of interest exists at. For example, an MVF might have an Annotation where each Fire Extinguisher is.

There are a wide variety of types of Annotation, including those for building safety, (fire extinguishers, alarm panels, AEDs), security (cameras, smart locks, motion detectors), and parking (EV chargers, bike racks, visitor parking), etc. Typically an application would have an idea the types of annotations it wants to feature in some view, rather than attempting to just show them all at once.

Annotations are useful to place as markers on the map. More complex objects with more properties and more differences between instances are better modeled with something like [Locations](../modules/_mappedin_mvf-locations.html).

## Spec

The Annotations extension adds an `annotationSymbols` property, along with an `annotations` object, with a `<floorId>` key and array of [AnnotationProperties](../types/_mappedin_mvf-annotations.index.AnnotationProperties.html) objects per floor.

### AnnotationSymbols

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