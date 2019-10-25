# `Try` interface

## Summary

| Function                                     | Return Type         | Summary                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Try.apply(supplier)`                        | `Try.<T>`           | Execute the given function and encapsulate the result in a Try, whether successful or not.                                                                                                                                                                                                                                                                   |
| `Try.flatApply(trySupplier)`                 | `Try.<T>`           | Similar to `apply`, this executes a function and captures any exceptions thrown into a Failure.                                                                                                                                                                                                                                                              |
| `Try.fromPromise(p)`                         | `Promise.<Try.<T>>` | Given a Promise for a value, returns a Promise for a Try of that value; the returned promise will always fulfill: if the given promise fulfills, the returned promise will fulfill with a success encapsulating the fulfillment value; if the given promise rejects, the returned promise will fulfill with a failure Try encapsulating the rejection error. |
| `Try.fromOption(option)`                     | `Try.<T>`           | Convert a scala-like Option object to a Try.                                                                                                                                                                                                                                                                                                                 |
| `Try.fromOptional(optional)`                 | `Try.<T>`           | Convert a java-like Optional object to a Try.                                                                                                                                                                                                                                                                                                                |
| `Try.fromMaybe(maybe)`                       | `Try.<T>`           | Converts a Maybe to a Try.                                                                                                                                                                                                                                                                                                                                   |
| `Try.createTryOperator(Observable)`          | `function`          | Creates an operator for Observables in the style of rxjs.                                                                                                                                                                                                                                                                                                    |
| `Try.createUnTryOperator(Observable)`        | `function`          | Similar to `createTryOperator`, this returns an Observable operator that transforms one observable into another.                                                                                                                                                                                                                                             |
| `Try.Success()`                              |                     |                                                                                                                                                                                                                                                                                                                                                              |
| `Try.Failure()`                              |                     |                                                                                                                                                                                                                                                                                                                                                              |
| `Try::isSuccess()`                           |                     |                                                                                                                                                                                                                                                                                                                                                              |
| `Try::isFailure()`                           |                     |                                                                                                                                                                                                                                                                                                                                                              |
| `Try::get()`                                 | `T`                 | Gets the encapsulated value if it's successful, otherwise throws the encapsulated error.                                                                                                                                                                                                                                                                     |
| `Try::toArray()`                             | `Array.<T>`         | Returns a new array containing the encapsulated value for a Success, or no values (an empty array) for a Failure.                                                                                                                                                                                                                                            |
| `Try::toNullable()`                          | `T`                 | Returns the encapsulated value of a success, or `null` for a failure.                                                                                                                                                                                                                                                                                        |
| `Try::toPromise()`                           | `Promise.<T>`       | Converts to this a settled promise.                                                                                                                                                                                                                                                                                                                          |
| `Try::getOrElse(defaultValue)`               | `T`                 | Get the encpauslated value from a Success, or else return the given default value for a Failure.                                                                                                                                                                                                                                                             |
| `Try::orElse(defaultTryValue)`               | `Try.<T>`           | Somewhat like `getOrElse`, but this doesn't do the `get` portion of it, meaning it doesn't give you the encapsulated value, it gives you a Try.                                                                                                                                                                                                              |
| `Try::forEach(consumer)`                     | `Try.<T>`           | A Try acts like a collection of 0 or 1 values, and this applies the given consumer to each item in the collection.                                                                                                                                                                                                                                           |
| `Try::catch(consumer)`                       | `Try.<T>`           | Used for performing side effects on failures: the given function will be invoked if and only if this Try is a failure, in which case it will be invoked with the encapsualted error.                                                                                                                                                                         |
| `Try::tap(valueConsumer, errorConsumer)`     | `Try.<T>`           | Used to perform side effects on success or failure.                                                                                                                                                                                                                                                                                                          |
| `Try::map(mapper)`                           | `Try.<U>`           | Maps the encapsulated value of a success through the given mapper and returns a success encapsulating the result.                                                                                                                                                                                                                                            |
| `Try::filter(predicate)`                     | `Try.<T>`           | If the Try is a success and its value passes the given predicate, the Try is returned.                                                                                                                                                                                                                                                                       |
| `Try::recover(errorMapper)`                  | `Try.<T>`           | Recovers a Failure Try by mapping the encapsulated error into a valid value with the given mapper.                                                                                                                                                                                                                                                           |
| `Try::recoverWith(recoverer)`                | `Try.<T>`           | Possibly recovers a Failure Try by mapping the encapsulated error into a Try.                                                                                                                                                                                                                                                                                |
| `Try::transform(mapSuccess, mapFailure)`     | `Try.<U>`           | Transforms this Try into another Try by transforming the encapsulated value of a success, or the encapsulated error of a failure through the given functions.                                                                                                                                                                                                |
| `Try::safeTransform(mapSuccess, mapFailure)` | `Try.<U>`           | Similar to `transform`, except that any error thrown by the selected mapper function is captured and returned as a Failure.                                                                                                                                                                                                                                  |
| `Try::transmute(mapSuccess, mapFailure)`     | `U`                 | Unpacks the Try into a value by applying one function for successes, and one for failures.                                                                                                                                                                                                                                                                   |
| `Try::failed()`                              | `Try.<Error>`       | Turns a Failure into a Success and vice-versa.                                                                                                                                                                                                                                                                                                               |
| `Try::toOptional(Optional)`                  | `Optional.<T>`      | Converts this to an Optional, as long as you can provide it with an appropriate factory.                                                                                                                                                                                                                                                                     |
| `Try::toOption(Option)`                      | `Option.<T>`        | Converts this to an Option using the provided factory object.                                                                                                                                                                                                                                                                                                |
| `Try::toMaybe(Maybe)`                        | `Maybe.<T>`         | Converts this to a Maybe using the provided factory.                                                                                                                                                                                                                                                                                                         |
| `Try::toObservable(Observable)`              | `Observable.<T>`    | Converts this Try to an Observable stream: A success returns an Observable that emits the encapsulated value and then completes, a failure turns an Observable that err's.                                                                                                                                                                                   |
| `Try::toSuppressingObservable(Observable)`   | `Observable.<T>`    | Converts this Try to an Observable stream that supresses the encapsulated error of a failure.                                                                                                                                                                                                                                                                |
| `Try::toHungObservable(Observable)`          | `Observable.<T>`    | Converts this Try to an Observable stream that works the same as a supressed observable stream returned by `toSuppressingObservable`, except the stream never completes (for either the failure or success case).                                                                                                                                            |
| `Try::permissive()`                          | `Try.<*>`           | Returns a permissive Try which encapsulates both successes and failures as successes.                                                                                                                                                                                                                                                                        |

## Member Details

### static functions

#### `apply(supplier)`

Execute the given function and encapsulate the result in a Try, whether successful
or not. If the func returns a value, this is returned
encapsulated in a Success. If the func throws an error, it is captured
in a Failure and returned.

| Parameter    | Type       | Description             |
| ------------ | ---------- | ----------------------- |
| **supplier** | `function` | The function to invoke. |

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<T>` |     |

#### `flatApply(trySupplier)`

Similar to `apply`, this executes a function and captures any exceptions thrown into
a Failure. The difference from `apply` is that the given function is assumed to already
return a `Try`, which is _not_ wrapped in another `Try`, but returned as is.

| Parameter       | Type       | Description |
| --------------- | ---------- | ----------- |
| **trySupplier** | `function` |             |

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<T>` |     |

#### `fromPromise(p)`

Given a Promise for a value, returns a Promise for a Try of that value;
the returned promise will always fulfill: if the given promise fulfills, the
returned promise will fulfill with a success encapsulating the fulfillment value;
if the given promise rejects, the returned promise will fulfill with a failure
Try encapsulating the rejection error.

| Parameter | Type          | Description                      |
| --------- | ------------- | -------------------------------- |
| **p**     | `Promise.<T>` | The promise to convert to a Try. |

|             |                     |     |
| ----------- | ------------------- | --- |
| **Returns** | `Promise.<Try.<T>>` |     |

#### `fromOption(option)`

Convert a scala-like Option object to a Try. If the option is defined (as defined by it's
`isDefined` method returning a truthy value), it's value (as returned by it's `get` method)
is returned encapsulated in a success. Otherwise a Failure is returned.

Note that error thrown attempting to invoke the method of the option are not handled, they will
be thrown. The `get` method is _only_ invoked if `isDefined` returns a truthy value.

| Parameter  | Type     | Description       |
| ---------- | -------- | ----------------- |
| **option** | `Object` | An Option object. |

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<T>` |     |

#### `fromOptional(optional)`

Convert a java-like Optional object to a Try. If the optional is present (as defined by it's
`isPresent` method returning a truthy value), it's value (as returned by it's `get` method)
is returned encapsulated in a success. Otherwise a Failure is returned.

Note that error thrown attempting to invoke the method of the option are not handled, they will
be thrown. The `get` method is _only_ invoked if `isPresent` returns a truthy value.

| Parameter    | Type     | Description         |
| ------------ | -------- | ------------------- |
| **optional** | `Object` | An Optional object. |

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<T>` |     |

#### `fromMaybe(maybe)`

Converts a Maybe to a Try. Assumes the Maybe implements the `map` and `getOrElse` methods;
the former returns another Maybe with the encapsulated value (if any) transformed according to
the given function; the latter returns the encapsulated value or invokes the provided supplier
if the Maybe has no encapsulated value and returns the result.

| Parameter | Type     | Description    |
| --------- | -------- | -------------- |
| **maybe** | `Object` | A Maybe object |

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<T>` |     |

#### `createTryOperator(Observable)`

Creates an operator for Observables in the style of rxjs. The operator
will map an observable to one that emits tries: values will be mapped
to successes encapsulating those values, and an error will be mapped to
a failure encapsulating that error. The generated observable will
terminate when the source observable terminate or errors.

| Parameter      | Type       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observable** | `function` | The factory function for creating a new Observable from a subscribe function. Now that this is not called with `new`, so if your function is costructor, you'll need to encapsulate that in a function. For instance, for rxjs, this could be `(subscribe) => new rxjs.Observable(subscribe)`. The `subscribe` function that will be passed to `Observable` is expected to be called with an `Observer` object that has `next`, `error`, and `complete` methods. |

|             |            |                                                                                                                                                                                                                                                                                             |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Returns** | `function` | The operator function which will take a source Observable and return a derived Observable that emits Tries as described above. The source Observable passed to the returned function is expected to have a `subscribe` method which takes three arguments: onNext, onError, and onComplete. |

#### `createUnTryOperator(Observable)`

Similar to `createTryOperator`, this returns an Observable operator
that transforms one observable into another. However, where as `createTryOperator`
returns an operator that wraps emitted values and errors in Tries, this function
returns an "untry" operator that unpacks emitted Tries, emitting the encapsulated
value of successes, and erring the stream for Failures.

| Parameter      | Type       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observable** | `function` | The factory function for creating a new Observable from a subscribe function. Now that this is not called with `new`, so if your function is costructor, you'll need to encapsulate that in a function. For instance, for rxjs, this could be `(subscribe) => new rxjs.Observable(subscribe)`. The `subscribe` function that will be passed to `Observable` is expected to be called with an `Observer` object that has `next`, `error`, and `complete` methods. |

|             |            |                                                                                                                                                                                                                                                                                             |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Returns** | `function` | The operator function which will take a source Observable and return a derived Observable that emits Tries as described above. The source Observable passed to the returned function is expected to have a `subscribe` method which takes three arguments: onNext, onError, and onComplete. |

#### `Success()`

#### `Failure()`

### instance functions

#### `isSuccess()`

#### `isFailure()`

#### `get()`

Gets the encapsulated value if it's successful, otherwise throws the
encapsulated error.

|             |     |                        |
| ----------- | --- | ---------------------- |
| **Returns** | `T` | the encapsulated value |

| Throws  | When                                         |
| ------- | -------------------------------------------- |
| `Error` | The encapsualted error if this is a Failure. |

#### `toArray()`

Returns a new array containing the encapsulated value for a Success, or
no values (an empty array) for a Failure.

|             |             |     |
| ----------- | ----------- | --- |
| **Returns** | `Array.<T>` |     |

#### `toNullable()`

Returns the encapsulated value of a success, or `null` for a failure.
Note that the encapsulated value of a success may be a `null`.

|             |     |     |
| ----------- | --- | --- |
| **Returns** | `T` |     |

#### `toPromise()`

Converts to this a settled promise. A success is converted to a promise that fulfills
with the encapsulated value, a failure is converted to a promise that rejects with the
encapsulated error.

|             |               |     |
| ----------- | ------------- | --- |
| **Returns** | `Promise.<T>` |     |

#### `getOrElse(defaultValue)`

Get the encpauslated value from a Success, or else return the given default
value for a Failure.

| Parameter        | Type | Description                                       |
| ---------------- | ---- | ------------------------------------------------- |
| **defaultValue** | `T`  | The default value to return if this is a Failure. |

|             |     |     |
| ----------- | --- | --- |
| **Returns** | `T` |     |

#### `orElse(defaultTryValue)`

Somewhat like `getOrElse`, but this doesn't do the `get` portion of it, meaning it
doesn't give you the encapsulated value, it gives you a Try. If this is a success, returns
itself. If this is a failure, returns the given value, _as is_.

| Parameter           | Type      | Description                                                      |
| ------------------- | --------- | ---------------------------------------------------------------- |
| **defaultTryValue** | `Try.<T>` | The encapsulated value (or failure) to use if this is a failure. |

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<T>` |     |

#### `forEach(consumer)`

A Try acts like a collection of 0 or 1 values, and this applies the given consumer
to each item in the collection. This is used for performing side effects.

Note that any errors thrown by the consumer will not be handled.

| Parameter    | Type       | Description                                              |
| ------------ | ---------- | -------------------------------------------------------- |
| **consumer** | `function` | A function that will consume the value, if there is one. |

|             |           |                       |
| ----------- | --------- | --------------------- |
| **Returns** | `Try.<T>` | returns the same Try. |

#### `catch(consumer)`

Used for performing side effects on failures: the given function will be invoked if and only
if this Try is a failure, in which case it will be invoked with the encapsualted error.

Note that any errors thrown by the consumer will not be handled.

| Parameter    | Type       | Description                                              |
| ------------ | ---------- | -------------------------------------------------------- |
| **consumer** | `function` | A function that will consume the error, if there is one. |

|             |           |                       |
| ----------- | --------- | --------------------- |
| **Returns** | `Try.<T>` | returns the same Try. |

#### `tap(valueConsumer, errorConsumer)`

Used to perform side effects on success or failure.

Note that any errors thrown by the selected consumer will not be handled.

| Parameter         | Type       | Description                                                                                  |
| ----------------- | ---------- | -------------------------------------------------------------------------------------------- |
| **valueConsumer** | `function` | The function that will be called to consume the encapsulated value if this Try is a success. |
| **errorConsumer** | `function` | The function that will be called to consume the encapsulated error if this Try is a failure. |

|             |           |                       |
| ----------- | --------- | --------------------- |
| **Returns** | `Try.<T>` | return this same Try. |

#### `map(mapper)`

Maps the encapsulated value of a success through the given mapper and returns a success encapsulating
the result. If the mapper throws an error, it's encapsulated in a failure. If this try is already
a failure, it is returned as is.

| Parameter  | Type       | Description |
| ---------- | ---------- | ----------- |
| **mapper** | `function` |             |

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<U>` |     |

#### `filter(predicate)`

If the Try is a success and its value passes the given predicate, the Try is returned.
If it does not pass the predicate, or if the predicate throws, a Failure is returned.
If the Try is already a Failure, it is returned.

| Parameter     | Type       | Description                                  |
| ------------- | ---------- | -------------------------------------------- |
| **predicate** | `function` | The predicate function to test this against. |

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<T>` |     |

#### `recover(errorMapper)`

Recovers a Failure Try by mapping the encapsulated error into a valid value with the given mapper.
If the given mapper throws an error, it's returned wrapped inside a new Failure. If this Try is a Success,
it is returned unchanged.

| Parameter       | Type       | Description                                                                                          |
| --------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| **errorMapper** | `function` | Function that turns an error into a value, or throws an error if the given error is not recoverable. |

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<T>` |     |

#### `recoverWith(recoverer)`

Possibly recovers a Failure Try by mapping the encapsulated error into a Try. This is similar to `recover`,
but the error mapper's returned value is assumed to already be a Try, which is returned. If the mapper
throws an error, it's returned in a new Failure. If this Try is already a Success, it is returned as is.

| Parameter     | Type       | Description                                                                                                                                                                          |
| ------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **recoverer** | `function` | Function that turns an error into a Try, with a failure for unreocverable errors (or errors that occurreed attemptig to recover), or with a success encapsulating a recovered value/ |

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<T>` |     |

#### `transform(mapSuccess, mapFailure)`

Transforms this Try into another Try by transforming the encapsulated value of a success, or the encapsulated
error of a failure through the given functions.

**Note**: if the applied function throws an error, it _is not captured_, it is thrown. If you want to capture
it in a Failure, use `safeTransform` instead.

| Parameter      | Type       | Description                                                                      |
| -------------- | ---------- | -------------------------------------------------------------------------------- |
| **mapSuccess** | `function` | The function applied to the encapsulated value of a success, to get the new Try. |
| **mapFailure** | `function` | The function applied to the encapsulated error of a failure, to get the new Try. |

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<U>` |     |

| Throws  | When                                           |
| ------- | ---------------------------------------------- |
| `Error` | Anything thrown by the applied mapper funtion. |

#### `safeTransform(mapSuccess, mapFailure)`

Similar to `transform`, except that any error thrown by the selected mapper function is captured and returned as
a Failure.

| Parameter      | Type       | Description                                                                      |
| -------------- | ---------- | -------------------------------------------------------------------------------- |
| **mapSuccess** | `function` | The function applied to the encapsulated value of a success, to get the new Try. |
| **mapFailure** | `function` | The function applied to the encapsulated error of a failure, to get the new Try. |

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<U>` |     |

#### `transmute(mapSuccess, mapFailure)`

Unpacks the Try into a value by applying one function for successes, and one for failures. Similar to `transform`
except the mappers aren't assumed to return a Try.

| Parameter      | Type       | Description |
| -------------- | ---------- | ----------- |
| **mapSuccess** | `function` |             |
| **mapFailure** | `function` |             |

|             |     |     |
| ----------- | --- | --- |
| **Returns** | `U` |     |

| Throws  | When                                              |
| ------- | ------------------------------------------------- |
| `Error` | Any error thrown by the selected mapper function. |

#### `failed()`

Turns a Failure into a Success and vice-versa. A Failure is turned into a Success encapsulating the error as
it's value. A Success is turned into a new Failure.

|             |               |     |
| ----------- | ------------- | --- |
| **Returns** | `Try.<Error>` |     |

#### `toOptional(Optional)`

Converts this to an Optional, as long as you can provide it with an appropriate factory. A success is returned as
an Optional of the encapsulated value, a failure is returned as an empty.

| Parameter    | Type     | Description                                                                              |
| ------------ | -------- | ---------------------------------------------------------------------------------------- |
| **Optional** | `Object` | an object that provides the `of` and `empty` factory functions for creating an Optional. |

|             |                |     |
| ----------- | -------------- | --- |
| **Returns** | `Optional.<T>` |     |

#### `toOption(Option)`

Converts this to an Option using the provided factory object. A success is converted to an Option of the encapsulated value,
a failure is converted to a None.

| Parameter  | Type     | Description                                                                            |
| ---------- | -------- | -------------------------------------------------------------------------------------- |
| **Option** | `Object` | An object that provides the `Some` and `None` factory function for creating an Option. |

|             |              |     |
| ----------- | ------------ | --- |
| **Returns** | `Option.<T>` |     |

#### `toMaybe(Maybe)`

Converts this to a Maybe using the provided factory. A success is converted to a Maybe of the encapsulated value using
the provided `Just` function. A failure returns the `Nothing` value.

| Parameter | Type     | Description                                                                                                           |
| --------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| **Maybe** | `Object` | An object that provides the `Just` factory function for creating a Maybe, and the `Nothing` singleton Maybe instance. |

|             |             |     |
| ----------- | ----------- | --- |
| **Returns** | `Maybe.<T>` |     |

#### `toObservable(Observable)`

Converts this Try to an Observable stream: A success returns an Observable that emits the encapsulated
value and then completes, a failure turns an Observable that err's.

| Parameter      | Type       | Description                                                                                                                                                                                                                                                  |
| -------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Observable** | `function` | a factory function that is called to create the returned observable by providing it with the "subscribe" function. Note that this is _not_ called with `new`, so if your `Observable` is a constructor, you'll need to encapsulate it in a factory function. |

|             |                  |     |
| ----------- | ---------------- | --- |
| **Returns** | `Observable.<T>` |     |

#### `toSuppressingObservable(Observable)`

Converts this Try to an Observable stream that supresses the encapsulated error of a failure. Same was
`toObservable`, but the failure case just completes immediately.

| Parameter      | Type       | Description |
| -------------- | ---------- | ----------- |
| **Observable** | `function` |             |

|             |                  |     |
| ----------- | ---------------- | --- |
| **Returns** | `Observable.<T>` |     |

#### `toHungObservable(Observable)`

Converts this Try to an Observable stream that works the same as a supressed observable stream returned
by `toSuppressingObservable`, except the stream never completes (for either the failure or success case).

| Parameter      | Type       | Description |
| -------------- | ---------- | ----------- |
| **Observable** | `function` |             |

|             |                  |     |
| ----------- | ---------------- | --- |
| **Returns** | `Observable.<T>` |     |

#### `permissive()`

Returns a permissive Try which encapsulates both successes and failures as successes. For successes, returns
a Try with the same encapsulated value. For failures, returns a success whose encapsulated value is the
encapsulated error.

|             |           |     |
| ----------- | --------- | --- |
| **Returns** | `Try.<*>` |     |
