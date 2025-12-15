# MVF Kinds

The Kinds extension provides a high level categorization of geometry in an MVF. A geometry can have only ONE kind, from the [KIND](../variables/_mappedin_mvf-kinds.KIND.html) enum. Examples include `room`, `hallway`, `wall`, and `area`.

Note that this is a [SafeStringEnum](../functions/_mappedin_mvf-core.utility-types_safe-enum_safe-enum.SafeStringEnumSchema.html), so `unknown` is a valid value. New kinds will likely be added in the future, and if the version of the MVF package being used does not support it, it will be downgraded to `unknown` automatically.

When consuming an MVF directly without this package, the downgrade will need to be handled by the application. An application may ignore the `unknown` kind, or have some generic behavior, but it must not crash or throw errors.

## Schema

The Kinds extension adds a `kinds` property to the MVF, which is a record of [FloorId](../types/_mappedin_mvf-core.core_identifiers_identifiers.FloorId.html) to [GeometryKinds](../types/_mappedin_mvf-kinds.GeometryKinds.html) objects.

GeometryKinds are records of [GeometryId](../types/_mappedin_mvf-core.core_identifiers_identifiers.GeometryId.html) to [Kind](../types/_mappedin_mvf-kinds.Kind.html) objects.

## Example

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