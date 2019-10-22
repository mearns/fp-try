/* eslint-env mocha */
/* eslint no-unused-expressions:0 */

// Module under test
const Try = require("../../src/index");

// Support
const chai = require("chai");
const sinon = require("sinon");
const { testMethod } = require("../test-utils");

chai.use(require("chai-as-promised"));
chai.use(require("sinon-chai"));

describe("Try.js", () => {
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

    testMethod("invert", def =>
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
});
