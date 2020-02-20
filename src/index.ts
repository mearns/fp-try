import {
    FailableSupplier,
    Option,
    OptionFactory,
    Optional,
    OptionalFactory,
    Maybe,
    MaybeFactory,
    Observable,
    ObservableFactory,
    ObservableSubscriber
} from "./common-types";

export default abstract class Try<T> implements FailableSupplier<T> {
    static unary;

    /**
     * Not recommended, you should generally prefer using `Try.apply` instead
     * of instantiating a new Success or Failure directly.
     */
    static Success<T>(value: T): Try<T> {
        return new Success(value);
    }

    /**
     * Not recommended, you should generally prefer using `Try.apply` instead
     * of instantiating a new Success or Failure directly.
     */
    static Failure<T>(error: Error): Try<T> {
        return new Failure(error);
    }

    /**
     * Execute the given function and encapsulate the result in a Try, whether successful
     * or not. If the func returns a value, this is returned
     * encapsulated in a Success. If the func throws an error, it is captured
     * in a Failure and returned.
     * @param {function():T} provider The function to invoke.
     * @returns {Try<T>}
     */
    static apply<T>(provider: () => T): Try<T> {
        let v: T;
        try {
            v = provider();
        } catch (error) {
            return new Failure(error);
        }
        return new Success(v);
    }

    static from<T>(base: FailableSupplier<T>) {
        if (base instanceof Try) {
            return base;
        }
        return Try.apply(() => base.get());
    }

    /**
     * Similar to `apply`, this executes a function and captures any exceptions thrown into
     * a Failure. The difference from `apply` is that the given function is assumed to already
     * return a `Try`, which is *not* wrapped in another `Try`, but returned as is.
     * @param {function():Try<T>} trySupplier
     * @returns {Try<T>}
     */
    static flatApply<T>(trySupplier: () => Try<T>): Try<T> {
        try {
            return trySupplier();
        } catch (error) {
            return new Failure(error);
        }
    }

    /**
     * Given a Promise for a value, returns a Promise for a Try of that value.
     * The returned promise will always fulfill: if the given promise fulfills, the
     * returned promise will fulfill with a success encapsulating the fulfillment value;
     * if the given promise rejects, the returned promise will fulfill with a failure
     * Try encapsulating the rejection error.
     *
     * @param {Promise<T>} p The promise to convert to a Try.
     * @returns {Promise<Try<T>>}
     */
    static fromPromise<T>(p: Promise<T>): Promise<Try<T>> {
        return p.then(
            (v: T) => new Success(v),
            (error: Error) => new Failure(error)
        );
    }

    /**
     * Convert a scala-like Option object to a Try. If the option is defined (as defined by it's
     * `isDefined` method returning a truthy value), it's value (as returned by it's `get` method)
     * is returned encapsulated in a success. Otherwise a Failure is returned.
     *
     * Note that error thrown attempting to invoke the method of the option are not handled, they will
     * be thrown. The `get` method is _only_ invoked if `isDefined` returns a truthy value.
     *
     * @param {Option<T>} option An Option object.
     * @returns {Try<T>}
     * @see Try.fromOptional
     */
    static fromOption<T>(option: Option<T>): Try<T> {
        if (option.isDefined()) {
            return new Success(option.get());
        }
        return new Failure(new Error("Option has no defined value"));
    }

    /**
     * Convert a java-like Optional object to a Try. If the optional is present (as defined by it's
     * `isPresent` method returning a truthy value), it's value (as returned by it's `get` method)
     * is returned encapsulated in a success. Otherwise a Failure is returned.
     *
     * Note that error thrown attempting to invoke the method of the option are not handled, they will
     * be thrown. The `get` method is _only_ invoked if `isPresent` returns a truthy value.
     *
     * @param {Optional<T>} optional An Optional object.
     * @returns {Try<T>}
     * @see Try.fromOption
     */
    static fromOptional<T>(optional: Optional<T>): Try<T> {
        if (optional.isPresent()) {
            return new Success(optional.get());
        }
        return new Failure(new Error("Optional value was not present"));
    }

    /**
     * Converts a Maybe to a Try. Assumes the Maybe implements the `map` and `getOrElse` methods;
     * the former returns another Maybe with the encapsulated value (if any) transformed according to
     * the given function; the latter returns the encapsulated value or invokes the provided supplier
     * if the Maybe has no encapsulated value and returns the result.
     *
     * @param {{map: function(function(T):Try<T>): {getOrElse: function(function():Try<T>)}}} maybe A Maybe object
     * @returns {Try<T>}
     */
    static fromMaybe<T>(maybe: Maybe<T>): Try<T> {
        return maybe
            .map<Try<T>>((v: T) => new Success(v))
            .getOrElse(() => new Failure(new Error("Maybe was nothing")));
    }

    /**
     * Creates an operator for Observables in the style of rxjs. The operator
     * will map an observable to one that emits tries: values will be mapped
     * to successes encapsulating those values, and an error will be mapped to
     * a failure encapsulating that error. The generated observable will
     * terminate when the source observable terminate or errors.
     *
     * @param {ObservableFactory<O2, Try<T>>} Observable The factory function
     * for creating a new Observable from a subscribe function. Note that this is not called with
     * `new`, so if your function is a costructor, you'll need to encapsulate that in another function.
     * For instance, for rxjs, this could be `(subscribe) => new rxjs.Observable(subscribe)`.
     * The `subscribe` function that will be passed to `Observable` is expected to be called
     * with an `Observer` object that has `next`, `error`, and `complete` methods.
     *
     * @returns {function(O):O2} The operator function which will take a source Observable
     * and return a derived Observable that emits Tries as described above. The source Observable passed
     * to the returned function is expected to have a `subscribe` method which takes three arguments:
     * onNext, onError, and onComplete.
     */
    static createTryOperator<
        O extends Observable<T>,
        O2 extends Observable<Try<T>>,
        T
    >(Observable: ObservableFactory<O2, Try<T>>): (source: O) => O2 {
        return (source: O) =>
            Observable((observer: ObservableSubscriber<Try<T>>) => {
                source.subscribe(
                    (v: T) => observer.next(new Success(v)),
                    (e: Error) => {
                        observer.next(new Failure(e));
                        observer.complete();
                    },
                    () => observer.complete()
                );
            });
    }

    /**
     * Similar to `createTryOperator`, this returns an Observable operator
     * that unpacks Try values emitted by an observable. Encapsulated values of successes
     * are emitted as values, and a failure emitted by the source stream is unpacked and
     * its encapsulated error is put out as an error.
     *
     * @param {ObservableFactory<O, T>} Observable The factory function
     * for creating a new Observable from a subscribe function. Now that this is not called with
     * `new`, so if your function is costructor, you'll need to encapsulate that in a function.
     * For instance, for rxjs, this could be `(subscribe) => new rxjs.Observable(subscribe)`.
     * The `subscribe` function that will be passed to `Observable` is expected to be called
     * with an `Observer` object that has `next`, `error`, and `complete` methods.
     *
     * @returns {function(O2): O} The operator function which will take a source Observable
     * and return a derived Observable that emits Tries as described above. The source Observable passed
     * to the returned function is expected to have a `subscribe` method which takes three arguments:
     * onNext, onError, and onComplete.
     */

    static createUnTryOperator<
        O extends Observable<T>,
        O2 extends Observable<Try<T>>,
        T
    >(Observable: ObservableFactory<O, T>): (source: O2) => O {
        return (source: O2) =>
            Observable((observer: ObservableSubscriber<T>) =>
                source.subscribe(
                    (t: Try<T>) => {
                        try {
                            t.tap(
                                (v: T) => observer.next(v),
                                (e: Error) => observer.error(e)
                            );
                        } catch (error) {
                            observer.error(error);
                        }
                    },
                    (e: Error) => observer.error(e),
                    () => observer.complete()
                )
            );
    }

    /**
     * @memberof Try#
     * @method isSuccess
     */
    abstract isSuccess(): boolean;

    /**
     * @memberof Try#
     * @method isFailure
     */
    abstract isFailure(): boolean;

    /**
     * Gets the encapsulated value if it's successful, otherwise throws the
     * encapsulated error.
     * @memberof Try#
     * @method get
     * @returns {T} the encapsulated value
     * @throws The encapsualted error if this is a Failure.
     */
    abstract get(): T;

    /**
     * Returns a new array containing the encapsulated value for a Success, or
     * no values (an empty array) for a Failure.
     * @memberof Try#
     * @method toArray
     * @returns {Array<T>}
     */
    abstract toArray(): Array<T>;

    /**
     * Returns the encapsulated value of a success, or `null` for a failure.
     * Note that the encapsulated value of a success may be a `null`.
     * @memberof Try#
     * @method toNullable
     * @returns {T?}
     */
    abstract toNullable(): T | null;

    /**
     * Converts to this a settled promise. A success is converted to a promise that fulfills
     * with the encapsulated value, a failure is converted to a promise that rejects with the
     * encapsulated error.
     * @memberof Try#
     * @method toPromise
     * @returns {Promise<T>}
     */
    abstract toPromise(): Promise<T>;

    /**
     * Get the encpauslated value from a Success, or else return the given default
     * value for a Failure.
     *
     * @memberof Try#
     * @method getOrElse
     * @param {T} defaultValue The default value to return if this is a Failure.
     * @returns {T}
     */
    abstract getOrElse(defaultValue: T): T;

    /**:
     * Somewhat like `getOrElse`, but this doesn't do the `get` portion of it, meaning it
     * doesn't give you the encapsulated value, it gives you a Try. If this is a success, returns
     * itself. If this is a failure, returns the given value, _as is_.
     *
     * @memberof Try#
     * @method orElse
     * @param {Try<T>} defaultTryValue The encapsulated value (or failure) to use if
     * this is a failure.
     * @return {Try<T>}
     */
    abstract orElse(defaultTryValue: Try<T>): Try<T>;

    /**
     * A Try acts like a collection of 0 or 1 values, and this applies the given consumer
     * to each item in the collection. This is used for performing side effects.
     *
     * Note that any errors thrown by the consumer will not be handled.
     *
     * @memberof Try#
     * @method forEach
     * @param {function(T):void} consumer A function that will consume the value, if there is one.
     * @returns {Try<T>} returns the same Try.
     * @throw Anything thrown by `consumer`.
     * @see Try#tap
     * @see Try#catch
     * @see Try#toArray
     */
    abstract forEach(consumer: (val: T) => void): Try<T>;

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
    abstract catch(consumer: (e: Error) => void): Try<T>;

    /**
     * Used to perform side effects on success or failure.
     *
     * Note that any errors thrown by the selected consumer will not be handled.
     *
     * @memberof Try#
     * @method tap
     * @param {function(T):void} valueConsumer The function that will be called to consume the encapsulated
     * value if this Try is a success.
     * @param {function(Error):void} errorConsumer The function that will be called to consume the
     * encapsulated error if this Try is a failure.
     * @throw Anything thrown by the invoked consuerm.
     * @returns {Try<T>} return this same Try.
     * @see Try#forEach
     * @see Try#catch
     * @see Try#transform
     */
    abstract tap(
        valueConsumer: (val: T) => void,
        errorConsumer: (e: Error) => void
    ): Try<T>;

    /**
     * Maps the encapsulated value of a success through the given mapper and returns a success encapsulating
     * the result. If the mapper throws an error, it's encapsulated in a failure. If this try is already
     * a failure, a new failure (of the appropriate type) encapsulating the same error is returned.
     * @memberof Try#
     * @method map
     * @param {function(T):U} mapper
     * @returns {Try<U>}
     */
    abstract map<U>(mapper: (t: T) => U): Try<U>;

    /**
     * Like `map`, except the mapper itself returns a Try.
     * @param mapper
     */
    abstract flatMap<U>(mapper: (t: T) => Try<U>): Try<U>;

    /**
     * If the Try is a success and its value passes the given predicate, the Try is returned.
     * If it does not pass the predicate, or if the predicate throws, a Failure is returned.
     * If the Try is already a Failure, it is returned.
     * @memberof Try#
     * @method filter
     * @param {function(T): boolean} predicate The predicate function to test this against.
     * @returns {Try<T>}
     */
    abstract filter(predicate: (T) => boolean): Try<T>;

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
    abstract recover(errorMapper: (Error) => T): Try<T>;

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
    abstract recoverWith(recoverer: (Error) => Try<T>): Try<T>;

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
    abstract transform<U>(
        mapSuccess: (T) => Try<U>,
        mapFailure: (Error) => Try<U>
    ): Try<U>;

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
    abstract safeTransform<U>(
        mapSuccess: (T) => Try<U>,
        mapFailure: (Error) => Try<U>
    ): Try<U>;

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
    abstract transmute<U>(mapSuccess: (T) => U, mapFailure: (Error) => U): U;

    /**
     * Turns a Failure into a Success and vice-versa. A Failure is turned into a Success encapsulating the error as
     * it's value. A Success is turned into a new Failure.
     *
     * You can kind of think of this as an assertion that the try is a failure: so if it is, the assertion passes,
     * so it results in a Success. If it's not a Failure, then the assertion fails, so it results in a Failure.
     *
     * @memberof Try#
     * @method failed
     * @returns {Try<Error>}
     */
    abstract failed(): Try<Error>;

    /**
     * Converts this to an Optional, as long as you can provide it with an appropriate factory. A success is returned as
     * an Optional of the encapsulated value, a failure is returned as an empty.
     * @memberof Try#
     * @method toOptional
     * @param {OptionalFactory<O, T>} Optional an object that provides the
     * `of` and `empty` factory functions for creating an Optional (denoted by type parameter `O`).
     * @returns {O}
     * @see Try#toOption
     */
    abstract toOptional<O extends Optional<T>>(
        Optional: OptionalFactory<O, T>
    ): O;

    /**
     * Converts this to an Option using the provided factory object. A success is converted to an Option of the encapsulated value,
     * a failure is converted to a None.
     * @memberof Try#
     * @method toOption
     * @param {OptionFactory<O, T>} Option An object that provides the
     * `Some` and `None` factory function for creating an Option.
     * @returns {O}
     * @see Try#toOptional
     */
    abstract toOption<O extends Option<T>>(Option: OptionFactory<O, T>): O;

    /**
     * Converts this to a Maybe using the provided factory. A success is converted to a Maybe of the encapsulated value using
     * the provided `Just` function. A failure returns the `Nothing` value.
     * @memberof Try#
     * @method toMaybe
     * @param {MaybeFactory<O, T>} Maybe An object that provides the
     * `Just` factory function for creating a Maybe, and the `Nothing` singleton Maybe instance.
     * @returns {M}
     */
    abstract toMaybe<M extends Maybe<T>>(Maybe: MaybeFactory<M, T>): M;

    /**
     * Converts this Try to an Observable stream: A success returns an Observable that emits the encapsulated
     * value and then completes, a failure turns an Observable that err's.
     * @memberof Try#
     * @method toObservable
     * @param {ObservableFactory<O, T>} Observable a factory function that is called to create
     * the returned observable by providing it with the "subscribe" function. Note that this is _not_ called with `new`,
     * so if your `Observable` is a constructor, you'll need to encapsulate it in a factory function.
     * @returns {O}
     */
    abstract toObservable<O extends Observable<T>>(
        Observable: ObservableFactory<O, T>
    ): O;

    /**
     * Converts this Try to an Observable stream that supresses the encapsulated error of a failure. Same was
     * `toObservable`, but the failure case just completes immediately.
     * @memberof Try#
     * @method toSuppressingObservable
     * @param {ObservableFactory<O, T>} Observable
     * @returns {O}
     */
    abstract toSuppressingObservable<O extends Observable<T>>(
        Observable: ObservableFactory<O, T>
    ): O;

    /**
     * Converts this Try to an Observable stream that works the same as a supressed observable stream returned
     * by `toSuppressingObservable`, except the stream never completes (for either the failure or success case).
     * @memberof Try#
     * @method toHungObservable
     * @param {ObservableFactory<O, T>} Observable
     * @returns {O}
     */
    abstract toHungObservable<O extends Observable<T>>(
        Observable: ObservableFactory<O, T>
    ): O;

    /**
     * Returns a permissive Try which encapsulates both successes and failures as successes. For successes, returns
     * a Try with the same encapsulated value. For failures, returns a success whose encapsulated value is the
     * encapsulated error.
     * @memberof Try#
     * @method permissive
     * @returns {Try<T|Error>}
     */
    abstract permissive(): Try<T | Error>;
}

class Success<T> extends Try<T> {
    private readonly value: T;

    constructor(value: T) {
        super();
        this.value = value;
    }

    isSuccess(): boolean {
        return true;
    }

    get(): T {
        return this.value;
    }

    isFailure(): boolean {
        return false;
    }

    toArray(): Array<T> {
        return [this.value];
    }

    toNullable(): T {
        return this.value;
    }

    async toPromise(): Promise<T> {
        return this.value;
    }

    getOrElse(defaultValue: T): T {
        return this.value;
    }

    orElse(defaultTryValue: Try<T>): Success<T> {
        return this;
    }

    forEach(consumer: (val: T) => void): Success<T> {
        consumer(this.value);
        return this;
    }

    catch(consumer: (e: Error) => void): Success<T> {
        return this;
    }

    tap(
        valueConsumer: (val: T) => void,
        errorConsumer: (e: Error) => void
    ): Success<T> {
        valueConsumer(this.value);
        return this;
    }

    map<U>(mapper: (t: T) => U): Try<U> {
        let u: U;
        try {
            u = mapper(this.value);
        } catch (mapperError) {
            return new Failure<U>(mapperError);
        }
        return new Success(u);
    }

    flatMap<U>(mapper: (t: T) => Try<U>): Try<U> {
        let t: Try<U>;
        try {
            t = mapper(this.value);
        } catch (mapperError) {
            return new Failure<U>(mapperError);
        }
        return t;
    }

    filter(predicate: (T) => boolean): Try<T> {
        let passes: boolean;
        try {
            passes = predicate(this.value);
        } catch (predicateError) {
            return new Failure(predicateError);
        }
        if (passes) {
            return this;
        }
        return new Failure(new Error("Predicate does not hold for this value"));
    }

    recover(errorMapper: (Error) => T): Try<T> {
        return this;
    }

    recoverWith(recoverer: (Error) => Try<T>): Try<T> {
        return this;
    }

    transform<U>(
        mapSuccess: (T) => Try<U>,
        mapFailure: (Error) => Try<U>
    ): Try<U> {
        return mapSuccess(this.value);
    }

    safeTransform<U>(
        mapSuccess: (T) => Try<U>,
        mapFailure: (Error) => Try<U>
    ): Try<U> {
        let v: Try<U>;
        try {
            v = mapSuccess(this.value);
        } catch (mapperError) {
            return new Failure(mapperError);
        }
        return v;
    }

    transmute<U>(mapSuccess: (T) => U, mapFailure: (Error) => U): U {
        return mapSuccess(this.value);
    }

    failed(): Failure<Error> {
        return new Failure(new Error("Try is not a Failure"));
    }

    toOptional<O extends Optional<T>>(Optional: OptionalFactory<O, T>): O {
        return Optional.of(this.value);
    }

    toOption<O extends Option<T>>(Option: OptionFactory<O, T>): O {
        return Option.Some(this.value);
    }

    toMaybe<M extends Maybe<T>>(Maybe: MaybeFactory<M, T>): M {
        return Maybe.Just(this.value);
    }

    toObservable<O extends Observable<T>>(
        Observable: ObservableFactory<O, T>
    ): O {
        return Observable(subscriber => {
            subscriber.next(this.value);
            subscriber.complete();
        });
    }

    toSuppressingObservable<O extends Observable<T>>(
        Observable: ObservableFactory<O, T>
    ): O {
        return Observable(subscriber => {
            subscriber.next(this.value);
            subscriber.complete();
        });
    }

    toHungObservable<O extends Observable<T>>(
        Observable: ObservableFactory<O, T>
    ): O {
        return Observable((subscriber: ObservableSubscriber<T>) => {
            subscriber.next(this.value);
        });
    }

    permissive(): Try<T | Error> {
        return new Success<T | Error>(this.value);
    }
}

class Failure<T> extends Try<T> {
    private readonly error: Error;

    constructor(error: Error) {
        super();
        this.error = error;
    }

    isSuccess(): boolean {
        return false;
    }

    get(): never {
        throw this.error;
    }

    isFailure(): boolean {
        return true;
    }

    toArray(): Array<T> {
        return [];
    }

    toNullable(): null {
        return null;
    }

    async toPromise(): Promise<T> {
        throw this.error;
    }

    getOrElse(defaultValue: T): T {
        return defaultValue;
    }

    orElse<D extends Try<T>>(defaultTryValue: D): D {
        return defaultTryValue;
    }

    forEach(consumer: (val: T) => void): Failure<T> {
        return this;
    }

    catch(consumer: (e: Error) => void): Failure<T> {
        consumer(this.error);
        return this;
    }

    tap(
        valueConsumer: (val: T) => void,
        errorConsumer: (e: Error) => void
    ): Failure<T> {
        errorConsumer(this.error);
        return this;
    }

    map<U>(mapper: (t: T) => U): Try<U> {
        return new Failure<U>(this.error);
    }

    flatMap<U>(mapper: (t: T) => Try<U>): Try<U> {
        return new Failure<U>(this.error);
    }

    filter(predicate: (T) => boolean): Try<T> {
        return this;
    }

    recover(errorMapper: (Error) => T): Try<T> {
        let v: T;
        try {
            v = errorMapper(this.error);
        } catch (mapperError) {
            return new Failure(mapperError);
        }
        return new Success(v);
    }

    recoverWith(recoverer: (Error) => Try<T>): Try<T> {
        try {
            return recoverer(this.error);
        } catch (mapperError) {
            return new Failure(mapperError);
        }
    }

    transform<U>(
        mapSuccess: (T) => Try<U>,
        mapFailure: (Error) => Try<U>
    ): Try<U> {
        return mapFailure(this.error);
    }

    safeTransform<U>(
        mapSuccess: (T) => Try<U>,
        mapFailure: (Error) => Try<U>
    ): Try<U> {
        let v: Try<U>;
        try {
            v = mapFailure(this.error);
        } catch (mapperError) {
            return new Failure(mapperError);
        }
        return v;
    }

    transmute<U>(mapSuccess: (T) => U, mapFailure: (Error) => U): U {
        return mapFailure(this.error);
    }

    failed(): Success<Error> {
        return new Success(this.error);
    }

    toOptional<O extends Optional<T>>(Optional: OptionalFactory<O, T>): O {
        return Optional.empty();
    }

    toOption<O extends Option<T>>(Option: OptionFactory<O, T>): O {
        return Option.None();
    }

    toMaybe<M extends Maybe<T>>(Maybe: MaybeFactory<M, T>): M {
        return Maybe.Nothing;
    }

    toObservable<O extends Observable<T>>(
        Observable: ObservableFactory<O, T>
    ): O {
        return Observable((subscriber: ObservableSubscriber<T>) => {
            subscriber.error(this.error);
        });
    }

    toSuppressingObservable<O extends Observable<T>>(
        Observable: ObservableFactory<O, T>
    ): O {
        return Observable((subscriber: ObservableSubscriber<T>) => {
            subscriber.complete();
        });
    }

    toHungObservable<O extends Observable<T>>(
        Observable: ObservableFactory<O, T>
    ): O {
        return Observable((subscriber: ObservableSubscriber<T>) => {});
    }

    permissive(): Try<T | Error> {
        return new Success<T | Error>(this.error);
    }
}

import unary from "./unary";
Try.unary = unary;
