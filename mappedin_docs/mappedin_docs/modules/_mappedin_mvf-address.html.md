# @mappedin/mvf-address

The address extension for MVF. Allows specifying an address for the entire bundle, as well as addresses for individual floor stacks.

An `Address` object is an object with keys representing different `type`s of address data, and values that contain the data in that format. As of right now, only one schema is supported: the `display` type. Addresses of the `display` type have a single `displayAddress` property, which is a formatted string that can be displayed directly to a user.

Future versions of this extension may add new types of structured address data, on new properties of the Address type.

Definition:

```
export type Address = {
   display?: {
      displayAddress?: string
   }
}

export type AddressExtension = {
   primary?: Address,
   floorStack?: Record<FloorStackId, Address>
}
Copy
```

Example:

```
{
  address: {
    primary: {
      display: {
        displayAddress: "5788 Wunsch Cliffs, Iristown, IA 75553"
      }
    },
    floorStack: {
      fs_0000001: {
        display: {
          displayAddress: "5788 Wunsch Cliffs, Iristown, IA 75553"
        }
      }
    }
  }
}
Copy
```