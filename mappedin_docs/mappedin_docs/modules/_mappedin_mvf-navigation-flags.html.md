# MVF Navigation Flags

## 1. Introduction

Navigation flags provide a mechanism to describe the properties of navigation paths within an MVF. They enable consumers of MVF data to make intelligent routing decisions based on the qualities of different paths. For example, an application might use flags to:

* Find routes that are wheelchair accessible
* Avoid outdoor areas when it's raining
* Only show paths that are open to the public
* Include VIP-only areas for authorized users

These flags can be applied to any wayfinding component in other extensions, including but not limited to [Connections](../modules/_mappedin_mvf-connections.html) and [Nodes](../modules/_mappedin_mvf-nodes.html)

# 2. Types

### 2.1 Navigation Flags Declarations

At the root of the MVF will be a `navigationFlagsDelcarations` property.

The NavigationFlagsDeclarations file contains a map of all navigation flag declarations for an MVF. For an MVF to be considered valid, all navigation flags used in any extensions MUST be declared in this file.

The key of the map is a unique, durable string identifier for the flag that developers use when interacting with the flag through an SDK. This will typically be something meaningful like `accessible` or `indoors`. The value will be a [NavigationFlagDeclaration](../types/_mappedin_mvf-navigation-flags.index.NavigationFlagDeclaration.html) object that describes the flag (in particular, the `index` and `bit` values used to check for the flag in a `flags` array).

### 2.2 Navigation Flag Declaration

A navigation flag declaration defines a single navigation property. Each declaration MUST include:

* `index`: The non-durable index of the flag the 32-bit integer in the `flags` array, provided by the `Flags` type. `index` MUST be sequential, starting at 0, and increasing by 1 for every 32 flag definitions.
* `bit`: The non-durable bit position (0-31) that will be set in the `flags` integer at the index specified by `index` used by other extensions to indicate the presence of this flag. `bit` MUST be sequential, starting at 0, and increasing by 1 for each new flag in the same `index`.

The combination of `index` and `bit` MUST be unique across all navigation flag declarations in the same MVF.

A declaration MAY also include:

* `details`: A [Details](../types/_mappedin_mvf-core.utility-types_details_details.Details.html) object that can provide additional information. This is usually a name, but may include other information such as description, images, and links. Like all details, it is targeted towards users, not developers.

### 2.3 Flags Type

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

### 2.4 Using Navigation Flags

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

## 3. Well Known Flags

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

### 3.1 Accessible

The `accessible` flag indicates that a navigation component is designed to be accessible to people using mobility aids such as wheelchairs. This includes appropriate width for doorways, paths taking ramps instead of stairs, and elevators instead of escalators.

### 3.2 Outdoors

The `outdoors` flag indicates that a navigation component is or goes outside.

### 3.3 Public

The `public` flag indicates that something is navigable by the public users of the building or space. By default, consumers of MVF should not route through non-public things when the public flag is present.

## 4. File Structure

The navigation flags extension adds a single file to the MVF bundle:

```
map-bundle/
âââ navigationFlags.json
Copy
```

The navigationFlags.json file contains an array of NavigationFlagDeclaration objects.

## 5. Implementation Guidelines

### 5.1 Checking for Flags

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

### 5.2 Setting Flags

When constructing an MVF, a developer can set flags on a flaggable object using a bitwise OR operation:

```
// To set a flag with bit position flagBit on an entity with existing flags
function setFlag(entityFlagBitfield: number, flagBit: number): number {
 return entityFlagBitfield | (1 << flagBit);
}
Copy
```

### 5.3 Making Types Navigation Flag Aware

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