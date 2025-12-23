# MVF Locations

The Locations extension adds a way to create Location/PoI metadata associated with one or more geometries. So where a specific Polygon might be `unit 123`, a Location might be attached to that Polygon, another an the floor above, and called "Macy's", with a description, photos and links to it's social media accounts.

A geometry can have multiple locations (including 0), and a location can have multiple geometries.

The locations extension adds three properties to the root of the MVF, corresponding to the three files:

* `locations`, for the `locations.json` file
* `locationCategories`, for the `location-categories.json` file
* `locationInstances`, for the `location-instances.json` file

## Schema

### Location

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

### LocationCategory

A LocationCategory is a category Locations may belong to. It may have a parent category, and will otherwise have a standard `details` property with at least a `name`.

### LocationInstance

A LocationInstance is a particular instance of an location (usually one that is attached to multiple geometries) that has some properties different from the parent. Eg, it may have different hours, or a slightly different name.

A LocationInstance:

* MUST have a parentId, referring to a Location.
* MUST have a unique ID, for localization to work.
* SHOULD have AT LEAST ONE polygon or node to anchor it in space.
* SHOULD have AT LEAST ONE other Location property set.

It is otherwise a `Partial<Location>`

### Example

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