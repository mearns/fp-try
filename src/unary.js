function method0(name) {
    const func = {
        [name]: (...args) => {
            if (args.length === 0) {
                return func;
            }
            const [t] = args;
            return t[name]();
        }
    }[name];
    return func;
}

module.exports = {
    isSuccess: method0("isSuccess"),
    isFailure: method0("isFailure"),
    toNullable: method0("toNullable"),
    toArray: method0("toArray"),
    toPromise: method0("toPromise"),
    getOrElse: def => t => t.getOrElse(def),
    orElse: def => t => t.orElse(def),
    forEach: consumer => t => t.forEach(consumer),
    catch: consumer => t => t.catch(consumer),
    tap: (vConsumer, eConsumer) => t => t.tap(vConsumer, eConsumer),
    filter: p => t => t.filter(p),
    recover: map => t => t.recover(map),
    recoverWith: rec => t => t.recoverWith(rec),
    transform: (vMap, eMap) => t => t.transform(vMap, eMap),
    safeTransform: (vMap, eMap) => t => t.safeTransform(vMap, eMap),
    transmute: (vMap, eMap) => t => t.transmute(vMap, eMap),
    invert: method0("invert"),
    toOptional: Optional => t => t.toOptional(Optional),
    toOption: Option => t => t.toOption(Option),
    toMaybe: Maybe => t => t.toMaybe(Maybe),
    toObservable: Observable => t => t.toObservable(Observable),
    toSuppressingObservable: Observable => t =>
        t.toSuppressingObservable(Observable),
    toHungObservable: Observable => t => t.toHungObservable(Observable),
    permissive: method0("permissive")
};
