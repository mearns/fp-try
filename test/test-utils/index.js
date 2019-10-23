/* eslint-env mocha */

const Try = require("../../src/index");
const { expect } = require("chai");
const sinon = require("sinon");

function createExpectationApi(func) {
    return {
        value: () => expect(func()),
        return: (...args) => expect(func(...args)),
        func: (...args) => expect(() => func(...args)),
        fut: func,
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

const OPTIONAL_OF = Symbol("Optional.Of");
const OPTIONAL_EMPTY = Symbol("Optional.Empty");
const TEST_OPTIONAL_TYPE = Object.freeze({
    of: v => ({
        type: OPTIONAL_OF,
        value: v
    }),
    empty: () => ({
        type: OPTIONAL_EMPTY
    }),
    OF: OPTIONAL_OF,
    EMPTY: OPTIONAL_EMPTY
});

const OPTION_SOME = Symbol("Option.Some");
const OPTION_NONE = Symbol("Option.None");
const TEST_OPTION_TYPE = Object.freeze({
    Some: v => ({
        type: OPTION_SOME,
        value: v
    }),
    None: () => ({
        type: OPTION_NONE
    }),
    SOME: OPTION_SOME,
    NONE: OPTION_NONE
});

const MAYBE_JUST = Symbol("Maybe.Just");
const MAYBE_NOTHING = Symbol("Maybe.Nothing");
const TEST_MAYBE_TYPE = Object.freeze({
    Just: v => ({
        type: MAYBE_JUST,
        value: v
    }),
    Nothing: Object.freeze({
        type: MAYBE_NOTHING
    }),
    JUST: MAYBE_JUST,
    NOTHING: MAYBE_NOTHING
});

function TEST_OBSERVABLE_TYPE(subscriberFunc) {
    return {
        subscribe: subscriberFunc
    };
}

function testObservable(observable) {
    const next = sinon.spy();
    const error = sinon.spy();
    const complete = sinon.spy();
    observable.subscribe({ next, error, complete });
    return { next, error, complete };
}

module.exports = {
    testMethod,
    TEST_OPTIONAL_TYPE,
    TEST_OPTION_TYPE,
    TEST_MAYBE_TYPE,
    TEST_OBSERVABLE_TYPE,
    testObservable
};
