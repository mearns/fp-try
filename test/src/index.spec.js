/* eslint-env mocha */
/* eslint no-unused-expressions:0 */

// Module under test
const Try = require("../..");

// Support
const chai = require("chai");
const sinon = require("sinon");
const {
    testMethod,
    TEST_OPTIONAL_TYPE,
    TEST_OPTION_TYPE,
    TEST_MAYBE_TYPE,
    TEST_OBSERVABLE_TYPE,
    testObservable
} = require("../test-utils");
const rxjs = require("rxjs");

chai.use(require("chai-as-promised"));
chai.use(require("sinon-chai"));

describe("fp-try as a JavaScript module", () => {
    testMethod("isSuccess", def =>
        def
            .aSuccess("should return true", expect => expect.value().to.be.true)
            .aFailure(
                "should return false",
                expect => expect.value().to.be.false
            )
    );

    testMethod("isFailure", def =>
        def
            .aSuccess(
                "should return false",
                expect => expect.value().to.be.false
            )
            .aFailure("should return true", expect => expect.value().to.be.true)
    );

    testMethod("toNullable", def =>
        def
            .aSuccess("should return the test value", (expect, v) =>
                expect.value().to.equal(v)
            )
            .aFailure("should return null", expect => expect.value().to.be.null)
    );

    testMethod("toArray", def =>
        def
            .aSuccess(
                "should return a singleton array containing the test value",
                (expect, v) => expect.value().to.deep.equal([v])
            )
            .aFailure("should return an empty array", expect =>
                expect.value().to.deep.equal([])
            )
    );

    testMethod("toPromise", def =>
        def
            .aSuccess(
                "should return a Promise that fulfills with the test value",
                async (expect, v) => expect.value().to.eventually.equal(v)
            )
            .aFailure(
                "should return a Promise that rejects with the test error",
                async (expect, e) => expect.value().to.be.rejectedWith(e)
            )
    );

    testMethod("get", def =>
        def
            .aSuccess("should return the test value", (expect, v) =>
                expect.return("default-value").to.equal(v)
            )
            .aFailure("should throw the encapsulated error", (expect, e) =>
                expect.func().to.throw(e)
            )
    );

    testMethod("getOrElse", def =>
        def
            .aSuccess("should return the test value", (expect, v) =>
                expect.return("default-value").to.equal(v)
            )
            .aFailure("should return the given default value", expect =>
                expect.return("default-value").to.equal("default-value")
            )
    );

    testMethod("orElse", def => {
        const altTry = Try.Success("alt-value");
        def.aSuccess("should return the original Try", (expect, v, it) =>
            expect.return(altTry).to.equal(it)
        ).aFailure("should return the given alternate Try", expect => {
            expect.return(altTry).to.equal(altTry);
        });
    });

    testMethod("map", def =>
        def
            .aSuccess(
                "should return a success that maps the encapuslated value",
                (expect, v) => {
                    expect
                        .return(x => x + x)
                        .to.satisfy(t => t.isSuccess() && t.get() === v + v);
                }
            )
            .aSuccess(
                "should return a failure encapsulating an error thrown by the mapper",
                expect => {
                    const testError = new Error("test mapper error");
                    const t = expect.fut(() => {
                        throw testError;
                    });
                    expect.that(t.isSuccess()).is.false;
                    t.catch(x => expect.that(x).equals(testError));
                }
            )
            .aFailure(
                "should return a failure that encapsulates the same error",
                (expect, e) => {
                    const mapper = sinon.spy();
                    const t = expect.fut(mapper);
                    expect.that(t.isSuccess()).is.false;
                    t.catch(x => expect.that(x).equals(e));
                    expect.that(mapper).is.not.called;
                }
            )
    );

    testMethod("flatMap", def =>
        def
            .aSuccess(
                "should return a success that flat maps the encapuslated value",
                (expect, v) => {
                    expect
                        .return(x => Try.Success("123-" + x))
                        .to.satisfy(
                            t => t.isSuccess() && t.get() === "123-" + v
                        );
                }
            )
            .aSuccess(
                "should return a failure encapsulating an error thrown by the mapper",
                expect => {
                    const testError = new Error("test mapper error");
                    const t = expect.fut(() => {
                        throw testError;
                    });
                    expect.that(t.isSuccess()).is.false;
                    t.catch(x => expect.that(x).equals(testError));
                }
            )
            .aFailure(
                "should return a failure that encapsulates the same error",
                (expect, e) => {
                    const mapper = sinon.spy();
                    const t = expect.fut(mapper);
                    expect.that(t.isSuccess()).is.false;
                    t.catch(x => expect.that(x).equals(e));
                    expect.that(mapper).is.not.called;
                }
            )
    );

    testMethod("forEach", def =>
        def
            .aSuccess(
                "should invoke the consumer once with the encapsulated value",
                (expect, v, it) => {
                    const spy = sinon.spy();
                    expect.return(spy).to.equal(it);
                    expect.that(spy).has.been.calledOnce;
                    expect.that(spy).has.been.calledWithExactly(v);
                }
            )
            .aFailure(
                "should not invoke the consumer at all",
                (expect, e, it) => {
                    const spy = sinon.spy();
                    expect.return(spy).to.equal(it);
                    expect.that(spy).has.not.been.called;
                }
            )
    );

    testMethod("catch", def =>
        def
            .aSuccess(
                "should not invoke the consumer at all",
                (expect, v, it) => {
                    const spy = sinon.spy();
                    expect.return(spy).to.equal(it);
                    expect.that(spy).has.not.been.called;
                }
            )
            .aFailure(
                "should invoke the consumer once with the encapsulated error",
                (expect, e, it) => {
                    const spy = sinon.spy();
                    expect.return(spy).to.equal(it);
                    expect.that(spy).has.been.calledOnce;
                    expect.that(spy).has.been.calledWithExactly(e);
                }
            )
    );

    testMethod("tap", def =>
        def
            .aSuccess(
                "should invoke the success consumer once with the encapsulated value",
                (expect, v, it) => {
                    const sSpy = sinon.spy();
                    const eSpy = sinon.spy();
                    expect.return(sSpy, eSpy).to.equal(it);
                    expect.that(sSpy).has.been.calledOnce;
                    expect.that(sSpy).has.been.calledWithExactly(v);
                    expect.that(eSpy).has.not.been.called;
                }
            )
            .aFailure(
                "should invoke the error consumer once with the encapsulated error",
                (expect, e, it) => {
                    const sSpy = sinon.spy();
                    const eSpy = sinon.spy();
                    expect.return(sSpy, eSpy).to.equal(it);
                    expect.that(eSpy).has.been.calledOnce;
                    expect.that(eSpy).has.been.calledWithExactly(e);
                    expect.that(sSpy).has.not.been.called;
                }
            )
    );

    testMethod("filter", def =>
        def
            .aSuccess(
                "should return itself if the predicate passes",
                (expect, v, it) => {
                    expect.return(x => x === v).to.equal(it);
                }
            )
            .aSuccess(
                "should return a failure if the predicate fails",
                (expect, v, it) => {
                    expect.return(x => x !== v).to.satisfy(t => t.isFailure());
                }
            )
            .aFailure(
                "should return itself if the predicate passes",
                (expect, e, it) => {
                    expect.return(() => true).to.equal(it);
                }
            )
            .aFailure(
                "should return itself if the predicate fails",
                (expect, e, it) => {
                    expect.return(() => false).to.equal(it);
                }
            )
    );

    testMethod("recover", def =>
        def
            .aSuccess(
                "should return itself without invoking the mapper",
                (expect, v, it) => {
                    const spy = sinon.spy();
                    expect.return(spy).to.equal(it);
                    expect.that(spy).has.not.been.called;
                }
            )
            .aFailure(
                "should return a success encapsulating the mapped value",
                (expect, e, it) => {
                    expect
                        .return(e => "test-recovery")
                        .to.satisfy(t => t.get() === "test-recovery");
                }
            )
            .aFailure(
                "should return a failure when the mapper function throws",
                expect => {
                    const testError = new Error("test-recovery-failed");
                    expect
                        .return(() => {
                            throw testError;
                        })
                        .to.satisfy(t => t.isFailure())
                        .and.to.satisfy(t =>
                            t.catch(e => expect.that(e).to.equal(testError))
                        );
                }
            )
    );

    testMethod("recoverWith", def =>
        def
            .aSuccess(
                "should return itself without invoking the mapper",
                (expect, v, it) => {
                    const spy = sinon.spy();
                    expect.return(spy).to.equal(it);
                    expect.that(spy).has.not.been.called;
                }
            )
            .aFailure(
                "should return a successful Try returned by the mapper",
                (expect, e, it) => {
                    const expectedTry = Try.Success("test-recovery");
                    expect.return(e => expectedTry).to.equal(expectedTry);
                }
            )
            .aFailure(
                "should return a failure Try returned by the mapper",
                (expect, e, it) => {
                    const expectedTry = Try.Failure(new Error("test-error"));
                    expect.return(e => expectedTry).to.equal(expectedTry);
                }
            )
    );

    testMethod("transform", def =>
        def
            .aSuccess(
                "should return a success Try returned by the valueMapper",
                (expect, v) => {
                    const failureMapper = sinon.spy();
                    expect
                        .return(v => Try.Success(v + v), failureMapper)
                        .to.satisfy(t => t.get() === v + v);
                    expect.that(failureMapper).has.not.been.called;
                }
            )
            .aSuccess(
                "should return a failure Try returned by the valueMapper",
                (expect, v) => {
                    const failureMapper = sinon.spy();
                    expect
                        .return(v => Try.Failure(new Error(String(v))))
                        .to.satisfy(t =>
                            t.catch(e =>
                                expect
                                    .that(e)
                                    .has.property("message", String(v))
                            )
                        );
                    expect.that(failureMapper).has.not.been.called;
                }
            )
            .aSuccess(
                "should throw an error thrown by the value mapper",
                expect => {
                    const testError = new Error("test value mapper error");
                    expect
                        .func(
                            () => {
                                throw testError;
                            },
                            () => {}
                        )
                        .to.throw(testError);
                }
            )
            .aFailure(
                "should return a success Try returned by the failureMapper",
                (expect, e) => {
                    const successMapper = sinon.spy();
                    expect
                        .return(successMapper, e => Try.Success(e.message))
                        .to.satisfy(t => t.get() === e.message);
                    expect.that(successMapper).has.not.been.called;
                }
            )
            .aFailure(
                "should return a failure Try returned by the failureMapper",
                (expect, e) => {
                    const successMapper = sinon.spy();
                    expect
                        .return(successMapper, e =>
                            Try.Failure(new Error(e.message + "-123"))
                        )
                        .to.satisfy(t =>
                            t.catch(ex =>
                                expect
                                    .that(ex)
                                    .has.property("message", e.message + "-123")
                            )
                        );
                    expect.that(successMapper).has.not.been.called;
                }
            )
            .aFailure(
                "should throw an error thrown by the error mapper",
                expect => {
                    const testError = new Error("test value mapper error");
                    expect
                        .func(
                            () => {},
                            () => {
                                throw testError;
                            }
                        )
                        .to.throw(testError);
                }
            )
    );

    testMethod("safeTransform", def =>
        def
            .aSuccess(
                "should return a success Try returned by the valueMapper",
                (expect, v) => {
                    const failureMapper = sinon.spy();
                    expect
                        .return(v => Try.Success(v + v), failureMapper)
                        .to.satisfy(t => t.get() === v + v);
                    expect.that(failureMapper).has.not.been.called;
                }
            )
            .aSuccess(
                "should return a failure Try returned by the valueMapper",
                (expect, v) => {
                    const failureMapper = sinon.spy();
                    expect
                        .return(v => Try.Failure(new Error(String(v))))
                        .to.satisfy(t =>
                            t.catch(e =>
                                expect
                                    .that(e)
                                    .has.property("message", String(v))
                            )
                        );
                    expect.that(failureMapper).has.not.been.called;
                }
            )
            .aSuccess(
                "should catch an error thrown by the value mapper and return as a failure",
                expect => {
                    const testError = new Error("test value mapper error");
                    expect
                        .return(
                            () => {
                                throw testError;
                            },
                            () => {}
                        )
                        .to.satisfy(t =>
                            t.catch(e => expect.that(e).is.equal(testError))
                        );
                }
            )
            .aFailure(
                "should return a success Try returned by the failureMapper",
                (expect, e) => {
                    const successMapper = sinon.spy();
                    expect
                        .return(successMapper, e => Try.Success(e.message))
                        .to.satisfy(t => t.get() === e.message);
                    expect.that(successMapper).has.not.been.called;
                }
            )
            .aFailure(
                "should return a failure Try returned by the failureMapper",
                (expect, e) => {
                    const successMapper = sinon.spy();
                    expect
                        .return(successMapper, e =>
                            Try.Failure(new Error(e.message + "-123"))
                        )
                        .to.satisfy(t =>
                            t.catch(ex =>
                                expect
                                    .that(ex)
                                    .has.property("message", e.message + "-123")
                            )
                        );
                    expect.that(successMapper).has.not.been.called;
                }
            )
            .aFailure(
                "should catch an error thrown by the failure mapper and return as a failure",
                expect => {
                    const testError = new Error("test value mapper error");
                    expect
                        .return(
                            () => {},
                            () => {
                                throw testError;
                            }
                        )
                        .to.satisfy(t =>
                            t.catch(e => expect.that(e).is.equal(testError))
                        );
                }
            )
    );

    testMethod("transmute", def =>
        def
            .aSuccess(
                "should return the value returned by the success mapper",
                (expect, v) => {
                    const errorMapper = sinon.spy();
                    expect.return(x => x + x, errorMapper).to.equal(v + v);
                    expect.that(errorMapper).has.not.been.called;
                }
            )
            .aSuccess(
                "should throw an error thrown by the success mapper",
                expect => {
                    const testError = new Error("test transmute error");
                    expect
                        .func(
                            () => {
                                throw testError;
                            },
                            () => {}
                        )
                        .to.throw(testError);
                }
            )
            .aFailure(
                "should return the value returned by the failure mapper",
                (expect, e) => {
                    const successMapper = sinon.spy();
                    expect
                        .return(successMapper, ex => ex.message)
                        .to.equal(e.message);
                    expect.that(successMapper).has.not.been.called;
                }
            )
            .aFailure(
                "should throw an error thrown by the failure mapper",
                expect => {
                    const testError = new Error("test transmute error");
                    expect
                        .func(
                            () => {},
                            () => {
                                throw testError;
                            }
                        )
                        .to.throw(testError);
                }
            )
    );

    testMethod("failed", def =>
        def
            .aSuccess("should be turned into a failure", expect => {
                expect.value().to.satisfy(t => t.isFailure());
            })
            .aFailure(
                "should be turned into a success encapsulating the original error as the value",
                (expect, e) => {
                    expect
                        .value()
                        .to.satisfy(t => t.isSuccess() && t.get() === e);
                }
            )
    );

    testMethod("toOptional", def =>
        def
            .aSuccess(
                "should return an optional of the encapsulated value",
                (expect, v) => {
                    expect
                        .return(TEST_OPTIONAL_TYPE)
                        .to.satisfy(
                            opt =>
                                opt.type === TEST_OPTIONAL_TYPE.OF &&
                                opt.value === v
                        );
                }
            )
            .aFailure("should return an empty optional", expect => {
                expect
                    .return(TEST_OPTIONAL_TYPE)
                    .to.have.property("type", TEST_OPTIONAL_TYPE.EMPTY);
            })
    );

    testMethod("toOption", def =>
        def
            .aSuccess(
                "should return a Some option of the encapsulated value",
                (expect, v) => {
                    expect
                        .return(TEST_OPTION_TYPE)
                        .to.satisfy(
                            opt =>
                                opt.type === TEST_OPTION_TYPE.SOME &&
                                opt.value === v
                        );
                }
            )
            .aFailure("should return a None optional", expect => {
                expect
                    .return(TEST_OPTION_TYPE)
                    .to.have.property("type", TEST_OPTION_TYPE.NONE);
            })
    );

    testMethod("toMaybe", def =>
        def
            .aSuccess(
                "should return a Just of the encapsulated value",
                (expect, v) => {
                    expect
                        .return(TEST_MAYBE_TYPE)
                        .to.satisfy(
                            opt =>
                                opt.type === TEST_MAYBE_TYPE.JUST &&
                                opt.value === v
                        );
                }
            )
            .aFailure("should return a Nothing maybe", expect => {
                expect
                    .return(TEST_MAYBE_TYPE)
                    .to.have.property("type", TEST_MAYBE_TYPE.NOTHING);
            })
    );

    testMethod("toObservable", def =>
        def
            .aSuccess(
                "should return an observable that emits the value and then ends",
                (expect, v) => {
                    const observable = expect.fut(TEST_OBSERVABLE_TYPE);
                    const sub = testObservable(observable);
                    expect.that(sub.next).has.been.calledOnceWithExactly(v);
                    expect.that(sub.error).has.not.been.called;
                    expect.that(sub.complete).has.been.calledOnceWithExactly();
                }
            )
            .aFailure(
                "should return an observable that emits the error",
                (expect, e) => {
                    const observable = expect.fut(TEST_OBSERVABLE_TYPE);
                    const sub = testObservable(observable);
                    expect.that(sub.next).has.not.been.called;
                    expect.that(sub.error).has.been.calledOnceWithExactly(e);
                    expect.that(sub.complete).has.not.been.called;
                }
            )
    );

    testMethod("toSuppressingObservable", def =>
        def
            .aSuccess(
                "should return an observable that emits the value and then completes",
                (expect, v) => {
                    const observable = expect.fut(TEST_OBSERVABLE_TYPE);
                    const sub = testObservable(observable);
                    expect.that(sub.next).has.been.calledOnceWithExactly(v);
                    expect.that(sub.error).has.not.been.called;
                    expect.that(sub.complete).has.been.calledOnceWithExactly();
                }
            )
            .aFailure(
                "should return an observable that completes immediately",
                expect => {
                    const observable = expect.fut(TEST_OBSERVABLE_TYPE);
                    const sub = testObservable(observable);
                    expect.that(sub.next).has.not.been.called;
                    expect.that(sub.error).has.not.been.called;
                    expect.that(sub.complete).has.been.calledOnceWithExactly();
                }
            )
    );

    testMethod("toHungObservable", def =>
        def
            .aSuccess(
                "should return an observable that emits the value and doesn't complete",
                (expect, v) => {
                    const observable = expect.fut(TEST_OBSERVABLE_TYPE);
                    const sub = testObservable(observable);
                    expect.that(sub.next).has.been.calledOnceWithExactly(v);
                    expect.that(sub.error).has.not.been.called;
                    expect.that(sub.complete).has.not.been.called;
                }
            )
            .aFailure(
                "should return an observable that emits the error and doesn't complete",
                (expect, e) => {
                    const observable = expect.fut(TEST_OBSERVABLE_TYPE);
                    const sub = testObservable(observable);
                    expect.that(sub.next).has.not.been.called;
                    expect.that(sub.error).has.not.been.called;
                    expect.that(sub.complete).has.not.been.called;
                }
            )
    );

    testMethod("permissive", def =>
        def
            .aSuccess(
                "should return a success that encapsulates the same value",
                (expect, v) => {
                    expect
                        .value()
                        .to.satisfy(t => t.isSuccess() && t.get() === v);
                }
            )
            .aFailure(
                "should return a success that encapsulates the error",
                (expect, e) => {
                    expect
                        .value()
                        .to.satisfy(t => t.isSuccess() && t.get() === e);
                }
            )
    );

    describe("Try.apply", () => {
        it("should return a success encapsulating the returned value", () => {
            const TEST_VALUE = "test-1234";
            const t = Try.apply(() => TEST_VALUE);
            chai.expect(t.isSuccess()).to.be.true;
            chai.expect(t.get()).to.equal(TEST_VALUE);
        });

        it("should catch an exception and return a failure encapsulating the error", () => {
            const TEST_EXCEPTION = new Error("Test Exception");
            const t = Try.apply(() => {
                throw TEST_EXCEPTION;
            });
            chai.expect(t.isSuccess()).to.be.false;
            t.catch(e => chai.expect(e).to.equal(TEST_EXCEPTION));
        });
    });

    describe("Try.fromPromise", () => {
        it("should return a promise for a success encapsulating the fulfillment value of a fulfilled promise", async () => {
            const TEST_VALUE = "test-fulfillment-value-123";
            const t = await Try.fromPromise(Promise.resolve(TEST_VALUE));
            chai.expect(t.isSuccess()).to.be.true;
            chai.expect(t.get()).to.equal(TEST_VALUE);
        });

        it("should return a promise for a failure encapsulating the rejection value of a rejected promise", async () => {
            const TEST_ERROR = new Error("test rejection error");
            const t = await Try.fromPromise(Promise.reject(TEST_ERROR));
            chai.expect(t.isSuccess()).to.be.false;
            t.catch(e => chai.expect(e).to.equal(TEST_ERROR));
        });
    });

    describe("Try.fromOption", () => {
        it("should return a success encapsulating the defined value for a defined option", () => {
            const TEST_VALUE = "test-fulfillment-value-123";
            const option = {
                isDefined: () => true,
                get: () => TEST_VALUE
            };
            const t = Try.fromOption(option);
            chai.expect(t.isSuccess()).to.be.true;
            chai.expect(t.get()).to.equal(TEST_VALUE);
        });

        it("should return a failure for an undefined option", () => {
            const option = {
                isDefined: () => false
            };
            const t = Try.fromOption(option);
            chai.expect(t.isSuccess()).to.be.false;
        });
    });

    describe("Try.fromOptional", () => {
        it("should return a success encapsulating the defined value for a present optional", () => {
            const TEST_VALUE = "test-fulfillment-value-123";
            const optional = {
                isPresent: () => true,
                get: () => TEST_VALUE
            };
            const t = Try.fromOptional(optional);
            chai.expect(t.isSuccess()).to.be.true;
            chai.expect(t.get()).to.equal(TEST_VALUE);
        });

        it("should return a failure for a non-present optional", () => {
            const optional = {
                isPresent: () => false
            };
            const t = Try.fromOptional(optional);
            chai.expect(t.isSuccess()).to.be.false;
        });
    });

    describe("Try.fromMaybe", () => {
        it("should return a success for a Just value", () => {
            const TEST_VALUE = "test-fulfillment-value-123";
            const maybe = {
                map: func => ({
                    getOrElse: () => func(TEST_VALUE)
                })
            };
            const t = Try.fromMaybe(maybe);
            chai.expect(t.isSuccess()).to.be.true;
            chai.expect(t.get()).to.equal(TEST_VALUE);
        });

        it("should return a failure for the None value", () => {
            const maybe = {
                map: () => ({
                    getOrElse: func => func()
                })
            };
            const t = Try.fromMaybe(maybe);
            chai.expect(t.isSuccess()).to.be.false;
        });
    });

    describe("Try.createTryOperator", () => {
        it("should map an observable by wrapping emitted events in successes", () => {
            const operator = Try.createTryOperator(
                (...args) => new rxjs.Observable(...args)
            );
            const source = rxjs.of(1, 4, 9);
            const dest = source.pipe(operator);
            const { next, error, complete } = testObservable(dest);
            chai.expect(next).to.have.been.calledThrice;
            chai.expect(next.firstCall.args).to.have.length(1);
            chai.expect(next.firstCall.args[0]).to.satisfy(
                t => t.isSuccess() && t.get() === 1
            );
            chai.expect(next.secondCall.args).to.have.length(1);
            chai.expect(next.secondCall.args[0]).to.satisfy(
                t => t.isSuccess() && t.get() === 4
            );
            chai.expect(next.thirdCall.args).to.have.length(1);
            chai.expect(next.thirdCall.args[0]).to.satisfy(
                t => t.isSuccess() && t.get() === 9
            );
            chai.expect(error).to.not.have.been.called;
            chai.expect(complete).to.have.been.calledOnceWithExactly();
            chai.expect(complete).to.have.been.calledAfter(next);
        });

        it("should map an observable by wrapping emitted errors in failures and completing", () => {
            const testError = new Error("test emitted error");
            const operator = Try.createTryOperator(
                (...args) => new rxjs.Observable(...args)
            );
            const source = rxjs.concat(rxjs.of(31), rxjs.throwError(testError));
            const dest = source.pipe(operator);
            const marbles = [];
            dest.subscribe(
                v => marbles.push(v),
                e => {
                    throw e;
                },
                () => marbles.push(null)
            );
            chai.expect(marbles).to.have.length(3);
            chai.expect(marbles[0]).to.satisfy(t => t.isSuccess());
            chai.expect(marbles[1]).to.satisfy(t => !t.isSuccess());
            chai.expect(marbles[2]).to.be.null;
        });
    });

    describe("Try.createUnTryOperator", () => {
        it("should map an observable by unwrapping emitted successes", () => {
            const operator = Try.createUnTryOperator(
                (...args) => new rxjs.Observable(...args)
            );
            const source = rxjs.of(Try.Success(7), Try.Success(5));
            const dest = source.pipe(operator);
            const marbles = [];
            dest.subscribe(
                v => marbles.push(v),
                e => {
                    throw e;
                },
                () => marbles.push(null)
            );
            chai.expect(marbles).to.have.length(3);
            chai.expect(marbles[0]).to.equal(7);
            chai.expect(marbles[1]).to.equal(5);
            chai.expect(marbles[2]).to.be.null;
        });

        it("should map an observable by unwrapping emitted failures and erring", () => {
            const testError = new Error("test failure");
            const operator = Try.createUnTryOperator(
                (...args) => new rxjs.Observable(...args)
            );
            const source = rxjs.of(
                Try.Success(70),
                Try.Failure(testError),
                Try.Success(18)
            );
            const dest = source.pipe(operator);
            const marbles = [];
            dest.subscribe(
                v => marbles.push([true, v]),
                e => marbles.push([false, e]),
                () => marbles.push(null)
            );
            chai.expect(marbles).to.have.length(2);
            chai.expect(marbles[0]).to.deep.equal([true, 70]);
            chai.expect(marbles[1]).to.deep.equal([false, testError]);
        });

        it("should map an observable by copying errors forward", () => {
            const testError = new Error("test failure");
            const operator = Try.createUnTryOperator(
                (...args) => new rxjs.Observable(...args)
            );
            const source = rxjs.concat(
                rxjs.of(Try.Success(110)),
                rxjs.throwError(testError),
                rxjs.of(Try.Failure(new Error("A different error")))
            );
            const dest = source.pipe(operator);
            const marbles = [];
            dest.subscribe(
                v => marbles.push([true, v]),
                e => marbles.push([false, e]),
                () => marbles.push(null)
            );
            chai.expect(marbles).to.have.length(2);
            chai.expect(marbles[0]).to.deep.equal([true, 110]);
            chai.expect(marbles[1]).to.deep.equal([false, testError]);
        });
    });
});
