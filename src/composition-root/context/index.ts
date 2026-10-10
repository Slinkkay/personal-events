import { AppLogger } from "@/log";
import { makeConsoleLogger } from "@/infrastructure/console";
import { memoize } from "@/composition-root";

export type ContextRoot = {
    getAppLogger(): AppLogger;
};

export function makeContextRoot(): ContextRoot {
    return {
        getAppLogger: memoize(() => makeConsoleLogger()),
    };
}
