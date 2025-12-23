# Safe Types

Safe Types is a package that uses the type system to force developers to make
decisions around errors and understand the consequences. These are primarily
based on Rust's error-handling system, but other langauges exist that do
error handling with a monad like this, like Haskell, OCaml, or Kotlin.

For developers seeing this for the first time, here is a quick overview.

## Overview

Essentially, the goal is that every time there is a fallible function, it should
to return a `Result<T, E>`, where `T` is the type of the data when everything
has run successfully, and `E` is the error type. These can be basically anything.

Say there is some function to add two arbitrary numbers. It needs to handle the case
when the number exceeds the 32-bit unsigned integer range. Writingthis the "normal"
Javascript way, it might look like this:

```
const checkedAdd = (a: number, b: number): number => {
	const sum = a + b;
	if (sum > 2 ** 32 - 1) {
		throw new Error(`${a} and ${b} exceed the 32-bit unsigned int limit`);
	}
	return sum;
};
Copy
```

The problem here is that the error isn't easily discoverable. It, could be documented,
but it doesn't actually enforce handling the error either:

```
const downstream = () => {
	const result = checkedAdd(2 ** 32 - 5, 5);
	// TS doesn't actually force handling this error, even if the function
	// is documented to say that it can throw.
};
Copy
```

With the `Result` type, it could be rewritten as:

```
const checkedAddSafe = (a: number, b: number): Result<number, string> => {
	const sum = a + b;
	if (sum > 2 ** 32 - 1) {
		return err(`${a} and ${b} exceed the 32-bit unsigned int limit`);
	}
	return ok(sum);
};
Copy
```

`err` and `ok` are functions that construct a "success" and "failure" result.
Downstream, anyone using this function is required to do something with it:

```
const downstream = () => {
	const result = checkedAddSafe(2 ** 32 - 5, 5);

	// I'm left with a Result that I have to check to be able to use the interior
	// value.

	if (result.isOk()) {
		console.log(result.value);
	}

	if (result.isErr()) {
		console.error(result.error);
	}
};
Copy
```

When interfacing with result-based code, to "fall back"
to traditional Javascript exception handling, call
`.unwrap()` on a result. Note this should be considered
unsafe and rarely used unless necessary.

## Safety Wrapping

It's inevitable that a developer will have to interact with code they don't own,
and it may not be possible to know whether or not it may throw an exception. For
this, use either `safeFn` or `safeAsyncFn` to create safe versions of these functions.

These are essentially a try-catch around the original function that converts any
caught errors into the error component of the Result type.

## Convenience Methods

It can sometimes feel awkward to work with results like this, but there are some
ways to make this easier to work with. Consider these trivial functions:

```
const fallible = (value: boolean): Result<number, string> => {
	if (value) {
		return ok(5);
	} else {
		return err('...');
	}
};

const lessThan5 = (value: number): Result<string, string> => {
	if (value < 5) {
		return ok('yep');
	} else {
		return ok('nope');
	}
};
Copy
```

* If an action is fallible, but there is some reasonable default or fallback
  value that can be used in case of an error, use `.unwrapOr(fallback)`.

  ```
  const valueT = fallible(true).unwrapOr(10); // valueT = 5;
  const valueF = fallible(false).unwrapOr(10); // valueF = 10;
  Copy
  ```
* To modify the interior value of a result, use `.map(fn)`.
  The function will *only* apply if the result was "good", and won't be used if
  there was an error.

  ```
  const valueT = fallible(true).map((n) => n * 2); // value = ok(10);
  const valueF = fallible(false).map((n) => n * 2); // value = err('...');
  Copy
  ```
* To modify the error contained in a result, use `.mapErr(fn)`.
  The function will *only* apply if the result was "bad", and won't be used if
  there was a good value.

  ```
  const valueT = fallible(true).mapErr(() => 'new'); // value = ok(5);
  const valueF = fallible(false).mapErr(() => 'new'); // value = err('new');
  Copy
  ```
* To perform a fallible action based on the "good" value of a result,
  use `.andThen(fn)`. This function should return a new Result with an
  error type that matches the existing one.

  ```
  const andResult = ok(1).andThen((v) => lessThan5(v)); // value = ok('yep');
  const valueT = fallible(true).andThen((v) => lessThan5(v)); // value = err('nope');
  const valueF = fallible(false).andThen((v) => lessThan5(v)); // value = err('...');
  Copy
  ```

These can be chained for a given result as well.

There are also some "top-level" utility functions for common scenarios:

* `isOk(result)` and `isErr(result)` are very handy for filtering lists.
  i.e. If you have an array of results, you can get only the succesful
  ones (or unsuccessful ones).
* `flatten()` can reduce an array of results into a single result where the
  "good" value is an array. If an error is present in the array, the error of
  the returned value will be the first one encountered.

  ```
  const results = [ok(1), ok(2), ok(3)];
  const flat = flatten(results); // flat = ok([1, 2, 3]);

  const resultsBad = [ok(1), ok(2), err(3), err(4), ok(5)];
  const flatBad = flatten(resultsBad); // flatBad = err(3);
  Copy
  ```
* `reduce()` can reduce a nested result by one stage, as long as both share an
  error type.

  ```
  const result = ok(ok(1));
  const reduced = reduce(result); // reduced = ok(1);

  const resultBad = err(1);
  const reducedBad = reduce(resultBad); // reducedBad = err(1);

  const resultNestedBad = ok(err(1));
  const reducedNested = reduce(resultNestedBad); // reducedNested = err(1);
  Copy
  ```

  However in most cases, `.andThen(r => r)` should be used if applicable.

## Method Chaining

Suppose there are a bunch of functions that return `Result`s,
and they should be combined into a single function. The methods `chain` and
`chainOk` are exposed to support this.

* `chain` takes a list of functions, where each function returns a `Result` type
  of some kind. The first function takes an arbitrary list of arguments, but
  subsequent functions are expected to take the result of the previous function.
  Regardless of the result of previous functions, all functions in the chain
  will be called.

  ```
  const manyFn = chain(
  	(x: number) => (x > 0 ? ok(x * 5) : err('1')),
  	(y: Result<number, string>) => y.map((x) => x * 10).mapErr('2'),
  	(z: Result<number, string>) =>
  		z.map((x) => `Result: ${x}`).mapErr(new Error('hi'))
  );

  const resultA = manyFn(1); // ok("Result: 50");
  const resultB = manyFn(0); // err(new Error("hi"));
  Copy
  ```
* `chainOk` works similarly to `chain`, except that subsequent functions should
  accept the type of the `Ok` variant of the result, rather than the result
  itself, of the previous function. This will also short-circuit, so later parts
  of the chain are not called if an error occurs earlier.

  ```
  const manyFn = chainOk(
  	(x: number) => (x > 0 ? ok(x * 5) : err('1')),
  	(y: number) => (y > 10 ? ok(y * 10) : err('2')),
  	(z: number) => (z > 150 ? ok(z * 2) : err('3'))
  );

  const resultA = manyFn(0); // err('1');
  const resultB = manyFn(1); // err('2');
  const resultC = manyFn(2); // err('3');
  const resultD = manyFn(4); // ok(400);
  Copy
  ```