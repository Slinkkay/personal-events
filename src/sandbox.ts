import { Mock } from "vitest";
import { debug } from "vitest-when";

export type SandboxUtils = {
    prefixedAlphaNumeric(prefix: string, length?: number): string;
    generateRandomValue(min: number, max: number): number;
    getToday(): Date;
    addMonth(date: Date): Date;
    randomizeArray<T>(input: T[]): T[];
    range(start: number, length: number): number[];
    logFailedMock(mock: Mock, args: any[]): Error;
};

export function makeSandboxUtils(): SandboxUtils {
    return {
        prefixedAlphaNumeric: (prefix, length) => {
            if (length === undefined) {
                length = 10;
            }
            return prefix + "-" + randomAlphaNumeric(length);
        },
        generateRandomValue: (min, max) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        getToday: () => {
            return new Date();
        },
        addMonth: (date) => {
            const nextMonth = new Date(date);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return nextMonth;
        },
        logFailedMock: (mock, args) => {
            const configuredStubs = debug(mock, { log: false }).stubbings;

            const formattedStubs = JSON.stringify(configuredStubs, null, 2);
            const formattedReceived = JSON.stringify(args, null, 2);

            return new Error(
                `[vitest-when] Mock was called with unexpected arguments:\n` +
                    `Received: \n${formattedReceived}\n\n` +
                    `Configured Stubs: \n${formattedStubs}`,
            );
        },
        randomizeArray: <T>(input: T[]): T[] => {
            const array = [...input];

            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));

                [array[i], array[j]] = [array[j], array[i]];
            }

            return array;
        },
        range: (start, length) => {
            return Array.from({ length }, (_, index) => start + index);
        },
    };
}

export function randomString(source: string, length: number) {
    let result = "";
    const charactersLength = source.length;
    for (let i = 0; i < length; i++) {
        result += source.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function randomAlphaNumeric(length: number) {
    const source = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return randomString(source, length);
}
