interface BaseTry<V> {
    isSuccess: () => boolean;
    get: () => V;
}

abstract class Try<T> implements BaseTry<T> {
    static from<T>(base: BaseTry<T>): Try<T> {
        if (base instanceof Try) {
            return base as Try<T>;
        }
        return new WrapperTry(base);
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
    abstract getOr(defaultTryValue: Try<T>): Try<T>;

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
}

class WrapperTry<T> extends Try<T> {
    private readonly base: BaseTry<T>;

    constructor(base: BaseTry<T>) {
        super();
        this.base = base;
    }

    isSuccess(): boolean {
        return this.base.isSuccess();
    }

    isFailure(): boolean {
        return !this.isSuccess();
    }

    get(): T {
        return this.base.get();
    }

    toArray(): Array<T> {
        try {
            return [this.base.get()];
        } catch (error) {
            return [];
        }
    }

    toNullable(): T | null {
        try {
            return this.base.get();
        } catch (error) {
            return null;
        }
    }

    async toPromise(): Promise<T> {
        try {
            return this.base.get();
        } catch (error) {
            throw error;
        }
    }

    getOrElse(defaultValue: T): T {
        try {
            return this.base.get();
        } catch (error) {
            return defaultValue;
        }
    }

    getOr(defaultTryValue: Try<T>): Try<T> {
        if (this.base.isSuccess()) {
            return this;
        }
        return defaultTryValue;
    }

    forEach(consumer: (val: T) => void): Try<T> {
        let v;
        try {
            v = this.get();
        } catch {
            return this;
        }
        consumer(v);
        return this;
    }

    catch(consumer: (e: Error) => void): Try<T> {
        try {
            this.get();
        } catch (error) {
            consumer(error);
        }
        return this;
    }

    tap(
        valueConsumer: (val: T) => void,
        errorConsumer: (e: Error) => void
    ): Try<T> {
        let v;
        try {
            v = this.get();
        } catch (error) {
            errorConsumer(error);
            return this;
        }
        valueConsumer(v);
        return this;
    }
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
        return;
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

    getOr(defaultTryValue: Try<T>): Success<T> {
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

    getOr<D extends Try<T>>(defaultTryValue: D): D {
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
}
