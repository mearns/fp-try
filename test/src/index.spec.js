/* eslint-env mocha */
/* eslint no-unused-expressions:0 */

// Module under test
const Try = require("../../src/index");

// Support
const chai = require("chai");
const sinon = require("sinon");
chai.use(require("chai-as-promised"));
chai.use(require("sinon-chai"));
const { expect } = chai;

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
});

function createExpectationApi(func) {
    return {
        value: () => expect(func()),
        return: (...args) => expect(func(...args)),
        func: (...args) => expect(() => func(...args)),
        that: expect
    };
}

function testMethod(name, def) {
    const tests = [];
    const createTest = (prefix, selector, describe, validate) => {
        tests.push([`${prefix} ${describe}`, selector, validate]);
    };
    const api = {};
    const oneSidedApi = (prefix, selector) => {
        const apiFunc = (describe, validate) => {
            createTest(prefix, selector, describe, validate);
            return api;
        };
        return apiFunc;
    };
    api.aSuccess = oneSidedApi("a success", (s, f) => s);
    api.aFailure = oneSidedApi("a failure", (s, f) => f);

    def(api);

    describe(`The ${name}`, () => {
        tests.forEach(([d, selector, validate]) => {
            const value = "test-value";
            const error = new Error("test-error");
            const t = selector(Try.Success(value), Try.Failure(error));
            const v = selector(value, error);

            it(`method for ${d}`, () => {
                const method = t[name].bind(t);
                return validate(createExpectationApi(method), v, t);
            });

            it(`unary function invoked on ${d}`, () => {
                const func = Try.unary[name];
                return validate(
                    createExpectationApi((...args) => func(...args)(t)),
                    v,
                    t
                );
            });
        });
    });
}
