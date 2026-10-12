import { failure, isSuccess, Result, success } from "@/result";
import { AppLogger } from "@/log";

export type SystemInit = {
    init(): Promise<Result>;
};

export type PersistenceInit = {
    createRolePersistence(): Result;
};

export function makeSystemInit(persistence: PersistenceInit, appLogger: AppLogger): SystemInit {
    return {
        init: async () => {
            const roleResult = persistence.createRolePersistence();

            if (!isSuccess(roleResult)) {
                appLogger.error({
                    type: "systemInit:failure",
                    message: "failed to init role persistence",
                });
                return failure();
            }

            appLogger.info({
                type: "systemInit:success",
            });
            return success();
        },
    };
}
