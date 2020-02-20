/* eslint-env mocha */
/* eslint no-unused-expressions:0 */

// Module under test
import Try from "../..";

// Support
import { expect } from "chai";

describe("fp-try as a typescript module", () => {
    it("demo-1", () => {
        type Creds = string;
        type ResultSet = [string, string];
        type User = { name: string };
        const DEFAULT_USER: User = { name: "DEFAULT" };
        const test = (
            getDatabaseCredentials: () => Creds,
            fetchUserDetails: (c: Creds) => ResultSet,
            mapResultsToUser: (rs: ResultSet) => User
        ): User => {
            return Try.apply(getDatabaseCredentials)
                .map(fetchUserDetails)
                .map(mapResultsToUser)
                .getOrElse(DEFAULT_USER);
        };

        expect(
            test(
                () => "user:pass",
                creds => creds.split(":").slice(0, 2) as [string, string],
                rs => ({
                    name: rs[0]
                })
            )
        ).to.deep.equal({ name: "user" });

        const testError = new Error("Test-Error");
        expect(
            test(
                () => "user:pass",
                () => {
                    throw testError;
                },
                rs => ({
                    name: rs[0]
                })
            )
        ).to.deep.equal(DEFAULT_USER);
    });
});
