/* eslint-env mocha */

// Module under test
const Try = require("../../src/index");

const { expect } = require("chai");

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

module.exports = {
    testMethod
};
