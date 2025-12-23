# MVF CMS Extension

The CMS Extension adds a number of properties to the MVF, all under the base `cms` property
This extra data is only available to certain CMS clients, and should not be used directly without
discussing the implications with your Mappedin representative.

In particular, everything in this extension is OPTIONAL, because much of it will eventually be promoted
to better, more standard MVF extensions, and deprecated out of this one. Others are only for use by the SDK.

If there is a piece of information available in the CMS Extension and another extension, USE THE
OTHER EXTENSION.

## Common Sub-Schemas

Most likely, if the CMS Extension is used, it will be for one of the following sub-schemas:

* [EnterpriseLocations](../types/_mappedin_mvf-cms.subSchemas_enterpriseLocations.EnterpriseLocationsSchema.html)
* [EnterpriseLocationInstance](../types/_mappedin_mvf-cms.subSchemas_enterpriseLocationInstance.EnterpriseLocationInstancesSchema.html)
* [EnterpriseVenue](../types/_mappedin_mvf-cms.subSchemas_enterpriseVenue.EnterpriseVenueSchema.html)
* [EnterpriseLayers](../types/_mappedin_mvf-cms.subSchemas_enterpriseLayers.EnterpriseLayersSchema.html)

### Enterprise Venue

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

### Enterprise Categories

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

### Enterprise Locations

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

### Enterprise Layers

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