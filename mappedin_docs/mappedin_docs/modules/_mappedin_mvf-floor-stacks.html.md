# MVF Floor Stacks

The Floor Stacks extension describes groups, or stacks, of floors. The are typically used to represent buildings, but this is not a requirement.

A floor can appear in multiple floor stacks, or none. It may NOT appear in the same floor stack twice.

If there is an `outdoors` floor, that information can be found in the [Outdoors](../modules/_mappedin_mvf-outdoors.html) extension, not here.

## Schema

The Floor Stacks extension adds a `floorStacks` property to the MVF, which is an array of [FloorStack](../types/_mappedin_mvf-floor-stacks.index.FloorStack.html) objects.

### FloorStack

FloorStack are an array of [FloorId](../types/_mappedin_mvf-core.core_identifiers_identifiers.FloorId.html)s. They may optionally have a `defaultFloor`, and a [Details](../types/_mappedin_mvf-core.utility-types_details_details.Details.html) object.

If the `FloorStack` does not have a `defaultFloor`, it is up to the consumer of the MVF to decide which floor is used as the default. Generally, a safe choice is the floor with elevation ordinal closest to 0.