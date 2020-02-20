/**
 * A Supplier type that could fail (throw an exception) instead
 * of actually supplying the value.
 */
export interface FailableSupplier<T> {
    /**
     * Supplies one value, or throws an error.
     */
    get: () => T;
}

export interface Optional<T> {
    isPresent: () => boolean;
    get: () => T;
}

export interface OptionalFactory<O extends Optional<T>, T> {
    of: (value: T) => O;
    empty: () => O;
}

export interface Option<T> {
    isDefined: () => boolean;
    get: () => T | null;
}

export interface OptionFactory<O extends Option<T>, T> {
    Some: (value: T) => O;
    None: () => O;
}

export interface Maybe<T> {
    map: <U>(mapper: (v: T) => U) => Maybe<U>;
    getOrElse: (defaultSupplier: () => T) => T;
}

export interface MaybeFactory<M extends Maybe<T>, T> {
    Just: (T) => M;
    readonly Nothing: M;
}

/**
 * An Observable is a stream you can subscribe by telling it what to
 * do when a new value is emitted, what to do when an error is emitted,
 * and what to do when the stream is completed.
 */
export interface Observable<T> {
    subscribe: (
        onNext?: (value: T) => void,
        onError?: (error: Error) => void,
        onComplete?: () => void
    ) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * A thing that subscribes to an Observer. This is conceptually tied to
 * the event handlers you pass to the `subscribe` method of
 * an `Observable`, but this is typically an internal type that the observable
 * library creates from those functions. Since the event handlers are all optional
 * in `Observerable::subscribe`, the library will fill in suitable noop handlers
 * on the ObservableSubscriber before passing it to the subscriber-func, so you
 * don't have to worry about checking to see if they're present or not.
 */
export interface ObservableSubscriber<T> {
    next: (value: T) => void;
    error: (error: Error) => void;
    complete: () => void;
}

/**
 * Denotes a factory function for creating an Observable. An Observable is
 * created when you invoke the factory function with a subscriber
 * function, which describes what to do when an `ObservableSubscriber` asks
 * to subscribe to the Observable.
 */
export type ObservableFactory<O extends Observable<T>, T> = (
    subscriberFunc: (subscriber: ObservableSubscriber<T>) => void
) => O;
