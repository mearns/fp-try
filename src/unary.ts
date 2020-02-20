/* eslint @typescript-eslint/explicit-function-return-type: 0 */

import {
    Option, // eslint-disable-line @typescript-eslint/no-unused-vars
    OptionFactory,
    Optional, // eslint-disable-line @typescript-eslint/no-unused-vars
    OptionalFactory,
    Maybe, // eslint-disable-line @typescript-eslint/no-unused-vars
    MaybeFactory,
    Observable, // eslint-disable-line @typescript-eslint/no-unused-vars
    ObservableFactory
} from "./common-types";

import Try from "./core";

const unary = {
    isSuccess: <T>(): ((t: Try<T>) => boolean) => (t: Try<T>) => t.isSuccess(),

    isFailure: <T>(): ((t: Try<T>) => boolean) => (t: Try<T>) => t.isFailure(),

    toNullable: <T>(): ((t: Try<T>) => T | null) => (t: Try<T>) =>
        t.toNullable(),

    toArray: <T>(): ((t: Try<T>) => Array<T>) => (t: Try<T>) => t.toArray(),

    toPromise: <T>(): ((t: Try<T>) => Promise<T>) => (t: Try<T>) =>
        t.toPromise(),

    get: <T>(): ((t: Try<T>) => T) => (t: Try<T>) => t.get(),

    getOrElse: <T>(def: T): ((t: Try<T>) => T) => (t: Try<T>) =>
        t.getOrElse(def),

    orElse: <T>(def: Try<T>): ((t: Try<T>) => Try<T>) => (t: Try<T>) =>
        t.orElse(def),

    forEach: <T>(consumer: (t: T) => void): ((t: Try<T>) => Try<T>) => (
        t: Try<T>
    ) => t.forEach(consumer),

    map: <T, U>(mapper: (t: T) => U): ((t: Try<T>) => Try<U>) => (t: Try<T>) =>
        t.map(mapper),

    flatMap: <T, U>(mapper: (t: T) => Try<U>) => (t: Try<T>) =>
        t.flatMap(mapper),

    catch: <T>(consumer: (e: Error) => void): ((t: Try<T>) => Try<T>) => (
        t: Try<T>
    ) => t.catch(consumer),

    tap: <T>(
        vConsumer: (t: T) => void,
        eConsumer: (e: Error) => void
    ): ((t: Try<T>) => Try<T>) => (t: Try<T>) => t.tap(vConsumer, eConsumer),

    filter: <T>(p: (t: T) => boolean): ((t: Try<T>) => Try<T>) => (t: Try<T>) =>
        t.filter(p),

    recover: <T>(map: (e: Error) => T): ((t: Try<T>) => Try<T>) => (
        t: Try<T>
    ) => t.recover(map),

    recoverWith: <T>(rec: (e: Error) => Try<T>): ((t: Try<T>) => Try<T>) => (
        t: Try<T>
    ) => t.recoverWith(rec),

    transform: <T, U>(
        vMap: (t: T) => Try<U>,
        eMap: (e: Error) => Try<U>
    ): ((t: Try<T>) => Try<U>) => (t: Try<T>) => t.transform(vMap, eMap),

    safeTransform: <T, U>(
        vMap: (t: T) => Try<U>,
        eMap: (e: Error) => Try<U>
    ): ((t: Try<T>) => Try<U>) => (t: Try<T>) => t.safeTransform(vMap, eMap),

    transmute: <T, U>(
        vMap: (t: T) => U,
        eMap: (e: Error) => U
    ): ((t: Try<T>) => U) => (t: Try<T>) => t.transmute(vMap, eMap),

    failed: <T>(): ((t: Try<T>) => Try<Error>) => (t: Try<T>) => t.failed(),

    toOptional: <O extends Optional<T>, T>(
        Optional: OptionalFactory<O, T>
    ): ((t: Try<T>) => O) => (t: Try<T>) => t.toOptional(Optional),

    toOption: <O extends Option<T>, T>(
        Option: OptionFactory<O, T>
    ): ((t: Try<T>) => O) => (t: Try<T>) => t.toOption(Option),

    toMaybe: <M extends Maybe<T>, T>(
        Maybe: MaybeFactory<M, T>
    ): ((t: Try<T>) => M) => (t: Try<T>) => t.toMaybe(Maybe),

    toObservable: <O extends Observable<T>, T>(
        Observable: ObservableFactory<O, T>
    ) => (t: Try<T>) => t.toObservable(Observable),

    toSuppressingObservable: <O extends Observable<T>, T>(
        Observable: ObservableFactory<O, T>
    ) => (t: Try<T>) => t.toSuppressingObservable(Observable),

    toHungObservable: <O extends Observable<T>, T>(
        Observable: ObservableFactory<O, T>
    ) => (t: Try<T>) => t.toHungObservable(Observable),

    permissive: <T>() => (t: Try<T>) => t.permissive()
};

export default unary;
export type Unary = typeof unary;
