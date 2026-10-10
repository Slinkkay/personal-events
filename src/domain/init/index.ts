import { Result, success } from "@/result";
import { AppLogger } from "@/log";

export type SystemInit = {
    init(): Promise<Result>;
};

export function makeSystemInit(appLogger: AppLogger): SystemInit {
    return {
        init: async () => {
            appLogger.info({
                type: "systemInit:success",
            });
            return success();
        },
    };
}
