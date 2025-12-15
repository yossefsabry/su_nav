# @mappedin/mvf

A starting point for interacting with MVF bundles. For Developers looking to get up and running with MVF, this is likely the best starting point.

## Default Parser

For most developers, the createMVFv3Parser function and associated type MVFv3 are what should be used. This provides an exporter parser, and a type for the parsed data for convenience.

```
import { createMVFv3Parser, type MVFv3 } from '@mappedin/mvf';

const parser = createMVFv3Parser().build().unwrap();

const myFunction = (data: MVFv3) => {
	// do something with the parsed data.
}

const mvf: MVFv3 = await parser.decompress(data).then((result) => result.unwrap());
const result = myFunction(data);
Copy
```

Note the use of `.unwrap()` on the result of some functions. As implemented, these APIs are guaranteed not to throw, but as a result the returned value must be transformed in some way to interact with it. Unwrapping a value essentially restores "default" Javascript behaviour and throw an exception if there was an error while performing the operation.

For more information on the parser API, see the [MVFParser](../classes/_mappedin_mvf-core.parser.MVFParser.html) docs.

## CMS Parser

For developers who have map data stored in Mappedin CMS, an additional parser preset is exposed to fit the format of that data.

```
import { createCMSMVFv3Parser, type CMSMVFv3 } from '@mappedin/mvf/preset-cms';
Copy
```

Otherwise, usage is the same as described above.