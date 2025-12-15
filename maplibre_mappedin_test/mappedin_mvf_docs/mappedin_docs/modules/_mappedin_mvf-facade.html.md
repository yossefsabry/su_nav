# MVF Facade

The Facade extension describes the [Geometry](../types/_mappedin_mvf-core.core_geometry_geometry.GeometrySchema.html) of a [FloorStack](../modules/_mappedin_mvf-floor-stacks.html) that live on [Floors](../types/_mappedin_mvf-core.core_floors_floors.FloorsSchema.html) not part of the stack. For example (and typically), the [Outdoors](../modules/_mappedin_mvf-outdoors.html) floor may have one or more polygons that represent the facade of a building, which is grouped into a single FloorStack with it's inner floors.

This is separate from the geometry of the `Floors`, which will usually be the exterior walls only. The `facade` may include extra geometry, such as a representation of the roof. As they are normal `Geometry` objects, the `facade` may get things like [styles](../modules/_mappedin_mvf-default-style.html), [floor images](../modules/_mappedin_mvf-floor-images.html), or even a [Location](../modules/_mappedin_mvf-locations.html) describing the building as a whole attached to it.

## Schema

The facade extension adds a `facade` property to the MVF, which is a record of [FloorStackId](../types/_mappedin_mvf-floor-stacks.index.FloorStackId.html) to [FacadeProperties](../types/_mappedin_mvf-facade.index.FacadeProperties.html).

### FacadeProperties

FacadeProperties are [WithGeometryAnchors](../types/_mappedin_mvf-core.utility-types_geometry-anchor_geometry-anchor.WithGeometryAnchors.html) objects, with at least one anchor, plus a `id` property that is a [FacadeId](../types/_mappedin_mvf-facade.index.FacadeId.html).

A facade may include anchors on multiple floors, if, for some reason, it has representation on them, but typically they will be on the [Outdoors](../modules/_mappedin_mvf-outdoors.html) floor.

### FacadeIntegrityError

FacadeIntegrityError is a simple object with a single property, `id`, which is the [FloorStackId](../types/_mappedin_mvf-floor-stacks.index.FloorStackId.html) of the facade.