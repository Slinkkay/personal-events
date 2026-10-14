import { failure, isSuccess, Result, success } from "@/result";
import { AppLogger } from "@/log";

export type SystemInit = {
    init(): Promise<Result>;
};

export type PersistenceInit = {
    createRolePersistence(): Result;
    createResponsibilityPersistence(): Result;
};

export function makeSystemInit(persistence: PersistenceInit, appLogger: AppLogger): SystemInit {
    return {
        init: async () => {
            const sequence = [
                {
                    type: "role",
                    init: () => persistence.createRolePersistence(),
                },
                {
                    type: "responsibility",
                    init: () => persistence.createResponsibilityPersistence(),
                },
            ];

            for (const item of sequence) {
                const result = item.init();
                if (!isSuccess(result)) {
                    appLogger.error({
                        type: "systemInit:failure",
                        message: `failed to init ${item.type} persistence`,
                    });
                    return failure();
                }
            }

            appLogger.info({
                type: "systemInit:success",
            });
            return success();
        },
    };
}
