import { expect, describe, it, beforeEach } from "vitest";
import { isSqliteConfig, SqliteConfig } from "./";
import { makeSandboxUtils, SandboxUtils } from "@/sandbox";

describe("Infrastructure, BetterSqlite3", () => {
    let sandbox: SandboxUtils;

    beforeEach(() => {
        sandbox = makeSandboxUtils();
    });

    describe("typeguard", () => {
        it("Properly checks for undefined", async () => {
            // Setup
            const config = undefined;

            // Execution
            const result = isSqliteConfig(config);

            // Validation
            expect(result).toBeFalsy();
        });

        it("Properly checks for properly type object", async () => {
            // Setup
            // TODO needs to be fixed as this is not a valid config object
            const config: any = {
                fileName: sandbox.prefixedAlphaNumeric("fileName"),
                tables: {
                    role: sandbox.prefixedAlphaNumeric("role"),
                    request: sandbox.prefixedAlphaNumeric("request"),
                },
                type: "sqlite",
            };

            // Execution
            const result = isSqliteConfig(config);

            // Validation
            expect(result).toBeTruthy();
        });
    });
});
