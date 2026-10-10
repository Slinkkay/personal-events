import { AppLogger } from "@/log";

export function makeConsoleLogger(): AppLogger {
    return {
        error: (params) => {
            console.error(params);
        },
        info: (params) => {
            console.log(params);
        },
    };
}
