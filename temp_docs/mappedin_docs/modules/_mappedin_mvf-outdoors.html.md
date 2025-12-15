# MVF Outdoors

The MVF Outdoors extension is used to describe which floors are outdoors in an MVF.

It adds a single property to the root of the bundle, `outdoors`, which contains a unique array of [FloorId](../types/_mappedin_mvf-core.core_identifiers_identifiers.FloorId.html)s. These floors are considered "outdoors" and may be treated specially by applications, such as always showing them on the map. Typically, there will only be one floor in an MVF that is outdoors, but there may be more at complex venues like airpots.

A floorId CANNOT be part of both `outdoors` and a [FloorStack](../modules/_mappedin_mvf-floor-stacks.html).