const unary = require("./unary");

/**
 * @interface Try
 */

/**
 * @memberof Try#
 * @method isSuccess
 */
/**
 * @memberof Try#
 * @method isFailure
 */
/**
 * Gets the encapsulated value if it's successful, otherwise throws the
 * encapsulated error.
 * @memberof Try#
 * @method get
 * @returns {T} the encapsulated value
 * @throws The encapsualted error if this is a Failure.
 */
/**
 * Returns a new array containing the encapsulated value for a Success, or
 * no values (an empty array) for a Failure.
 * @memberof Try#
 * @method toArray
 * @returns {Array<T>}
 */
/**
 * Returns the encapsulated value of a success, or `null` for a failure.
 * Note that the encapsulated value of a success may be a `null`.
 * @memberof Try#
 * @method toNullable
 * @returns {T?}
 */
/**
 * Converts to this a settled promise. A success is converted to a promise that fulfills
 * with the encapsulated value, a failure is converted to a promise that rejects with the
 * encapsulated error.
 * @memberof Try#
 * @method toPromise
 * @returns {Promise<T>}
 */
/**
 * Get the encpauslated value from a Success, or else return the given default
 * value for a Failure.
 *
 * @memberof Try#
 * @method getOrElse
 * @param {T} defaultValue The default value to return if this is a Failure.
 * @returns {T}
 */
/**
 * Somewhat like `getOrElse`, but this doesn't do the `get` portion of it, meaning it
 * doesn't give you the encapsulated value, it gives you a Try. If this is a success, returns
 * itself. If this is a failure, returns the given value, _as is_.
 *
 * @memberof Try#
 * @method orElse
 * @param {Try<T>} defaultTryValue The encapsulated value (or failure) to use if
 * this is a failure.
 */
/**
 * A Try acts like a collection of 0 or 1 values, and this applies the given consumer
 * to each item in the collection. This is used for performing side effects.
 *
 * Note that any errors thrown by the consumer will not be handled.
 *
 * @memberof Try#
 * @method forEach
 * @param {function(T):Void} consumer A function that will consume the value, if there is one.
 * @returns {Try<T>} returns the same Try.
 * @throw Anything thrown by `consumer`.
 * @see Try#tap
 * @see Try#catch
 * @see Try#toArray
 */
/**
 * Used for performing side effects on failures: the given function will be invoked if and only
 * if this Try is a failure, in which case it will be invoked with the encapsualted error.
 *
 * Note that any errors thrown by the consumer will not be handled.
 *
 * @memberof Try#
 * @method catch
 * @param {function(Error):Void} consumer A function that will consume the error, if there is one.
 * @returns {Try<T>} returns the same Try.
 * @throw Anything thrown by `consumer`.
 * @see Try#forEach For a similar mechanism, but for successes and their values.
 * @see Try#tap
 * @see Try#recover If you want map to a new Try in the event of an error.
 */
/**
 * Used to perform side effects on success or failure.
 *
 * Note that any errors thrown by the selected consumer will not be handled.
 *
 * @memberof Try#
 * @method tap
 * @param {function(T):Void} valueConsumer The function that will be called to consume the encapsulated
 * value if this Try is a success.
 * @param {function(Error):Void} errorConsumer The function that will be called to consume the
 * encapsulated error if this Try is a failure.
 * @throw Anything thrown by the invoked consuerm.
 * @returns {Try<T>} return this same Try.
 * @see Try#forEach
 * @see Try#catch
 * @see Try#transform
 */
/**
 * Maps the encapsulated value of a success through the given mapper and returns a success encapsulating
 * the result. If the mapper throws an error, it's encapsulated in a failure. If this try is already
 * a failure, it is returned as is.
 * @memberof Try#
 * @method map
 * @param {function(T):U} mapper
 * @returns {Try<U>}
 */
/**
 * If the Try is a success and its value passes the given predicate, the Try is returned.
 * If it does not pass the predicate, or if the predicate throws, a Failure is returned.
 * If the Try is already a Failure, it is returned.
 * @memberof Try#
 * @method filter
 * @param {function(T): boolean} predicate The predicate function to test this against.
 * @returns {Try<T>}
 */
/**
 * Recovers a Failure Try by mapping the encapsulated error into a valid value with the given mapper.
 * If the given mapper throws an error, it's returned wrapped inside a new Failure. If this Try is a Success,
 * it is returned unchanged.
 *
 * @memberof Try#
 * @method recover
 * @param {function(Error): T} errorMapper Function that turns an error into a value, or throws an error if
 * the given error is not recoverable.
 * @returns {Try<T>}
 */
/**
 * Possibly recovers a Failure Try by mapping the encapsulated error into a Try. This is similar to `recover`,
 * but the error mapper's returned value is assumed to already be a Try, which is returned. If the mapper
 * throws an error, it's returned in a new Failure. If this Try is already a Success, it is returned as is.
 *
 * @memberof Try#
 * @method recoverWith
 * @param {function(Error):Try<T>} recoverer Function that turns an error into a Try, with a failure for unreocverable
 * errors (or errors that occurreed attemptig to recover), or with a success encapsulating a recovered value/
 * @returns {Try<T>}
 */
/**
 * Transforms this Try into another Try by transforming the encapsulated value of a success, or the encapsulated
 * error of a failure through the given functions.
 *
 * **Note**: if the applied function throws an error, it _is not captured_, it is thrown. If you want to capture
 * it in a Failure, use `safeTransform` instead.
 *
 * @memberof Try#
 * @method transform
 * @param {function(T):Try<U>} mapSuccess The function applied to the encapsulated value of a success, to get the new Try.
 * @param {function(Error):Try<U>} mapFailure The function applied to the encapsulated error of a failure, to get the new Try.
 * @returns {Try<U>}
 * @throws Anything thrown by the applied mapper funtion.
 * @see Try#safeTransform
 */
/**
 * Similar to `transform`, except that any error thrown by the selected mapper function is captured and returned as
 * a Failure.
 *
 * @memberof Try#
 * @method safeTransform
 * @param {Function(T):Try<U>} mapSuccess The function applied to the encapsulated value of a success, to get the new Try.
 * @param {Function(Error):Try<U>} mapFailure The function applied to the encapsulated error of a failure, to get the new Try.
 * @returns {Try<U>}
 */
/**
 * Unpacks the Try into a value by applying one function for successes, and one for failures. Similar to `transform`
 * except the mappers aren't assumed to return a Try.
 *
 * @memberof Try#
 * @method transmute
 * @param {function(T):U} mapSuccess
 * @param {function(Error):U} mapFailure
 * @returns {U}
 * @throws Any error thrown by the selected mapper function.
 */
/**
 * Turns a Failure into a Success and vice-versa. A Failure is turned into a Success encapsulating the error as
 * it's value. A Success is turned into a new Failure.
 * @memberof Try#
 * @method invert
 * @returns {Try<Error>}
 */
/**
 * Converts this to an Optional, as long as you can provide it with an appropriate factory. A success is returned as
 * an Optional of the encapsulated value, a failure is returned as an empty.
 * @memberof Try#
 * @method toOptional
 * @param {{of: (function(T): Optional<T>), empty: (function(): Optional<T>)}} Optional an object that provides the
 * `of` and `empty` factory functions for creating an Optional.
 * @returns {Optional<T>}
 * @see Try#toOption
 */
/**
 * Converts this to an Option using the provided factory object. A success is converted to an Option of the encapsulated value,
 * a failure is converted to a None.
 * @memberof Try#
 * @method toOption
 * @param {{Some: (function(T): Option<T>), None: (function(): Option<T>)}} Option An object that provides the
 * `Some` and `None` factory function for creating an Option.
 * @returns {Option<T>}
 * @see Try#toOptional
 */
/**
 * Converts this to a Maybe using the provided factory. A success is converted to a Maybe of the encapsulated value using
 * the provided `Just` function. A failure returns the `Nothing` value.
 * @memberof Try#
 * @method toMaybe
 * @param {{Just: (function(T): Maybe<T>), Nothing: Maybe<T>}} Maybe An object that provides the
 * `Just` factory function for creating a Maybe, and the `Nothing` singleton Maybe instance.
 * @returns {Maybe<T>}
 */
/**
 * Converts this Try to an Observable stream: A success returns an Observable that emits the encapsulated
 * value and then completes, a failure turns an Observable that err's.
 * @memberof Try#
 * @method toObservable
 * @param {function(function(subscriber)): Observable<T>} Observable a factory function that is called to create
 * the returned observable by providing it with the "subscribe" function. Note that this is _not_ called with `new`,
 * so if your `Observable` is a constructor, you'll need to encapsulate it in a factory function.
 * @returns {Observable<T>}
 */
/**
 * Converts this Try to an Observable stream that supresses the encapsulated error of a failure. Same was
 * `toObservable`, but the failure case just completes immediately.
 * @memberof Try#
 * @method toSuppressingObservable
 * @param {function(function(subscriber)): Observable<T>} Observable
 * @returns {Observable<T>}
 */
/**
 * Converts this Try to an Observable stream that works the same as a supressed observable stream returned
 * by `toSuppressingObservable`, except the stream never completes (for either the failure or success case).
 * @memberof Try#
 * @method toHungObservable
 * @param {function(function(subscriber)): Observable<T>} Observable
 * @returns {Observable<T>}
 */
/**
 * Returns a permissive Try which encapsulates both successes and failures as successes. For successes, returns
 * a Try with the same encapsulated value. For failures, returns a success whose encapsulated value is the
 * encapsulated error.
 * @memberof Try#
 * @method permissive
 * @returns {Try<*>}
 */

/**
 *
 */
class Try {}

/**
 * Execute the given function and encapsulate the result in a Try, whether successful
 * or not. If the func returns a value, this is returned
 * encapsulated in a Success. If the func throws an error, it is captured
 * in a Failure and returned.
 * @param {function():T} supplier The function to invoke.
 * @returns {Try<T>}
 */
Try.apply = supplier => {
    try {
        return Try.Success(supplier());
    } catch (e) {
        return Try.Failure(e);
    }
};

/**
 * Similar to `apply`, this executes a function and captures any exceptions thrown into
 * a Failure. The difference from `apply` is that the given function is assumed to already
 * return a `Try`, which is *not* wrapped in another `Try`, but returned as is.
 * @param {function():Try<T>} trySupplier
 * @returns {Try<T>}
 */
Try.flatApply = trySupplier => {
    try {
        return trySupplier();
    } catch (e) {
        return Try.Failure(e);
    }
};

/**
 * Given a Promise for a value, returns a Promise for a Try of that value;
 * the returned promise will always fulfill: if the given promise fulfills, the
 * returned promise will fulfill with a success encapsulating the fulfillment value;
 * if the given promise rejects, the returned promise will fulfill with a failure
 * Try encapsulating the rejection error.
 *
 * @param {Promise<T>} p The promise to convert to a Try.
 * @returns {Promise<Try<T>>}
 */
Try.fromPromise = async p => {
    return p.then(Try.Success, Try.Failure);
};

/**
 * Convert a scala-like Option object to a Try. If the option is defined (as defined by it's
 * `isDefined` method returning a truthy value), it's value (as returned by it's `get` method)
 * is returned encapsulated in a success. Otherwise a Failure is returned.
 *
 * Note that error thrown attempting to invoke the method of the option are not handled, they will
 * be thrown. The `get` method is _only_ invoked if `isDefined` returns a truthy value.
 *
 * @param {{isDefined: function():Boolean, get: function():T}} option An Option object.
 * @returns {Try<T>}
 * @see Try.fromOptional
 */
Try.fromOption = option => {
    if (option.isDefined()) {
        return Try.Success(option.get());
    }
    return Try.Failure(new Error("Option has no defined value"));
};

/**
 * Convert a java-like Optional object to a Try. If the optional is present (as defined by it's
 * `isPresent` method returning a truthy value), it's value (as returned by it's `get` method)
 * is returned encapsulated in a success. Otherwise a Failure is returned.
 *
 * Note that error thrown attempting to invoke the method of the option are not handled, they will
 * be thrown. The `get` method is _only_ invoked if `isPresent` returns a truthy value.
 *
 * @param {{isPresent: function():Boolean, get: function():T}} optional An Optional object.
 * @returns {Try<T>}
 * @see Try.fromOption
 */
Try.fromOptional = optional => {
    if (optional.isPresent()) {
        return Try.Success(optional.get());
    }
    return Try.Failure(new Error("Optional value was not present"));
};

// Not recommended: figure out which object you have at code-time and pick
// the correct function.
// Try.fromOpt = opt => {
//     if (typeof opt.get === "function") {
//         if (typeof opt.isDefined === "function") {
//             return Try.fromOption(opt);
//         } else if (typeof opt.isPresent === "function") {
//             return Try.fromOptional(opt);
//         }
//     }
//     throw new Error("Given opt does not appear to be an Option or an Optional");
// };

/**
 * Converts a Maybe to a Try. Assumes the Maybe implements the `map` and `getOrElse` methods;
 * the former returns another Maybe with the encapsulated value (if any) transformed according to
 * the given function; the latter returns the encapsulated value or invokes the provided supplier
 * if the Maybe has no encapsulated value and returns the result.
 *
 * @param {{map: function(function(T):Try<T>): {getOrElse: function(function():Try<T>)}}} maybe A Maybe object
 * @returns {Try<T>}
 */
Try.fromMaybe = maybe => {
    return maybe
        .map(Try.Success)
        .getOrElse(() => Try.Failure(new Error("Maybe was nothing")));
};

/**
 * Creates an operator for Observables in the style of rxjs. The operator
 * will map an observable to one that emits tries: values will be mapped
 * to successes encapsulating those values, and an error will be mapped to
 * a failure encapsulating that error. The generated observable will
 * terminate when the source observable terminate or errors.
 *
 * @param {function(function(Observer):Subscription): Observable} Observable The factory function
 * for creating a new Observable from a subscribe function. Now that this is not called with
 * `new`, so if your function is costructor, you'll need to encapsulate that in a function.
 * For instance, for rxjs, this could be `(subscribe) => new rxjs.Observable(subscribe)`.
 * The `subscribe` function that will be passed to `Observable` is expected to be called
 * with an `Observer` object that has `next`, `error`, and `complete` methods.
 *
 * @returns {function(Observable):Observable} The operator function which will take a source Observable
 * and return a derived Observable that emits Tries as described above. The source Observable passed
 * to the returned function is expected to have a `subscribe` method which takes three arguments:
 * onNext, onError, and onComplete.
 */
Try.createTryOperator = Observable => {
    return source =>
        Observable(observer =>
            source.subscribe(
                v => observer.next(Try.Success(v)),
                e => {
                    observer.next(Try.Failure(e));
                    observer.complete();
                },
                () => observer.complete()
            )
        );
};

/**
 * Similar to `createTryOperator`, this returns an Observable operator
 * that transforms one observable into another. However, where as `createTryOperator`
 * returns an operator that wraps emitted values and errors in Tries, this function
 * returns an "untry" operator that unpacks emitted Tries, emitting the encapsulated
 * value of successes, and erring the stream for Failures.
 *
 * @param {function(function(Observer):Subscription): Observable} Observable The factory function
 * for creating a new Observable from a subscribe function. Now that this is not called with
 * `new`, so if your function is costructor, you'll need to encapsulate that in a function.
 * For instance, for rxjs, this could be `(subscribe) => new rxjs.Observable(subscribe)`.
 * The `subscribe` function that will be passed to `Observable` is expected to be called
 * with an `Observer` object that has `next`, `error`, and `complete` methods.
 *
 * @returns {function(Observable):Observable} The operator function which will take a source Observable
 * and return a derived Observable that emits Tries as described above. The source Observable passed
 * to the returned function is expected to have a `subscribe` method which takes three arguments:
 * onNext, onError, and onComplete.
 */
Try.createUnTryOperator = Observable => {
    return source =>
        Observable(observer =>
            source.subscribe(
                t => {
                    t.transmute(v => observer.next(v), e => observer.error(e));
                },
                e => observer.error(e),
                () => observer.complete()
            )
        );
};

Try.Success = value => {
    return new Success(value);
};

Try.Failure = error => {
    return new Failure(error);
};

Try.unary = unary;

/**
 * @implements Try
 */
class Failure extends Try {
    constructor(error) {
        super();
        this._error = error;
    }

    isSuccess() {
        return false;
    }

    isFailure() {
        return true;
    }

    get() {
        throw this._error;
    }

    toNullable() {
        return null;
    }

    toArray() {
        return [];
    }

    toPromise() {
        return Promise.reject(this._error);
    }

    getOrElse(defaultValue) {
        return defaultValue;
    }

    orElse(defaultTryValue) {
        return defaultTryValue;
    }

    forEach(consumer) {
        return this;
    }

    catch(consumer) {
        consumer(this._error);
        return this;
    }

    tap(valueConsumer, errorConsumer) {
        errorConsumer(this._error);
        return this;
    }

    map(mapper) {
        return this;
    }

    flatMap(mapper) {
        return this;
    }

    filter(predicate) {
        return this;
    }

    recover(errorMapper) {
        return Try.apply(() => errorMapper(this._error));
    }

    recoverWith(recoverer) {
        return Try.flatApply(() => recoverer(this._error));
    }

    transform(mapSuccess, mapFailure) {
        return mapFailure(this._error);
    }

    transmute(mapSuccess, mapFailure) {
        return mapFailure(this._error);
    }

    safeTransform(mapSuccess, mapFailure) {
        return Try.flatApply(() => mapFailure(this._error));
    }

    invert() {
        return Try.Success(this._error);
    }

    toOptional(Optional) {
        return Optional.empty();
    }

    toOption(Option) {
        return Option.None();
    }

    toMaybe(Maybe) {
        return Maybe.Nothing;
    }

    toObservable(Observable) {
        return Observable(subscriber => {
            subscriber.error(this._error);
        });
    }

    toSuppressingObservable(Observable) {
        return Observable(subscriber => {
            subscriber.complete();
        });
    }

    toHungObservable(Observable) {
        return Observable(subscriber => {});
    }

    permissive() {
        return Try.Success(this._error);
    }
}

/**
 * @implements Try
 */
class Success extends Try {
    constructor(value) {
        super();
        this._value = value;
    }

    isSuccess() {
        return true;
    }

    isFailure() {
        return false;
    }

    get() {
        return this._value;
    }

    toNullable() {
        return this._value;
    }

    toArray() {
        return [this._value];
    }

    toPromise() {
        return Promise.resolve(this._value);
    }

    getOrElse(defaultValue) {
        return this._value;
    }

    orElse(defaultTryValue) {
        return this;
    }

    forEach(consumer) {
        consumer(this._value);
        return this;
    }

    catch(consumer) {
        return this;
    }

    tap(valueConsumer, errorConsumer) {
        valueConsumer(this._value);
        return this;
    }

    map(mapper) {
        return Try.apply(() => mapper(this._value));
    }

    flatMap(mapper) {
        return Try.flatApply(() => mapper(this._value));
    }

    filter(predicate) {
        return Try.flatApply(() =>
            predicate(this._value)
                ? this
                : Try.Failure(
                      new Error(`Predicate does not hold for ${this._value}`)
                  )
        );
    }

    recover(errorMapper) {
        return this;
    }

    recoverWith(recoverer) {
        return this;
    }

    transform(mapSuccess, mapFailure) {
        return mapSuccess(this._value);
    }

    transmute(mapSuccess, mapFailure) {
        return mapSuccess(this._value);
    }

    safeTransform(mapSuccess, mapFailure) {
        return Try.flatApply(() => mapSuccess(this._value));
    }

    invert() {
        return Try.Failure(new Error("Inverted a Successful Try"));
    }

    toOptional(Optional) {
        return Optional.of(this._value);
    }

    toOption(Option) {
        return Option.Some(this._value);
    }

    toMaybe(Maybe) {
        return Maybe.Just(this._value);
    }

    toObservable(Observable) {
        return Observable(subscriber => {
            subscriber.next(this._value);
            subscriber.complete();
        });
    }

    toSuppressingObservable(Observable) {
        return this.toObservable(Observable);
    }

    toHungObservable(Observable) {
        return Observable(subscriber => {
            subscriber.next(this._value);
        });
    }

    permissive() {
        return Try.Success(this._value);
    }
}

module.exports = Try;
