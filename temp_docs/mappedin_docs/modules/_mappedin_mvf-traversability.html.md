# MVF Traversability

The Traversability extension provides a way to define which geometries can be walked on/through, and which cannot. It is primarily used to influence the automatic node generation process.

## Schema

The Traversability extension adds two properties to the root of the bundle, `walkable` and `nonwalkable`, which are Records of [FloorId](../types/_mappedin_mvf-core.core_identifiers_identifiers.FloorId.html) to [WalkableGeometries](../types/_mappedin_mvf-traversability.index.WalkableGeometries.html) and [NonWalkableGeometries](../types/_mappedin_mvf-traversability.index.NonWalkableGeometries.html) objects.

If a geometry id is present in a walkable record, it can be walked over. If it is present in a nonwalkable record, it will block walking. If it is both, nodes may be generated to walk up to it, but not through it. If it is in neither, it will be ignored for the purposes of node generation.