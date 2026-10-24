import { failure, isSuccess, success, ValueResult } from "@/result";
import { GetResponsibility, Responsibility } from "@/domain/responsibility";
import { AppLogger } from "@/log";

export type GetResponsibilityFromRoleCommand = {
    roleId: string;
};

export type ResponsibilityFromRolePersistence = {
    findAll(command: { roleId: string }): Promise<ValueResult<string[]>>;
};

export type GetResponsibilityFromRole = {
    get(command: GetResponsibilityFromRoleCommand): Promise<ValueResult<Responsibility[]>>;
};

export function makeGetResponsibilityFromRole(
    persistence: ResponsibilityFromRolePersistence,
    getResponsibility: GetResponsibility,
    appLogger: AppLogger,
): GetResponsibilityFromRole {
    return {
        get: async ({ roleId }) => {
            const associatedResult = await persistence.findAll({
                roleId,
            });

            if (!isSuccess(associatedResult)) {
                return failure();
            }

            const responsibilities: Responsibility[] = [];

            for await (let id of associatedResult.value) {
                const itemResult = await getResponsibility.get({
                    id,
                });

                if (!isSuccess(itemResult)) {
                    appLogger.error({
                        type: "failed-to-find-responsibilty",
                        id,
                    });
                    return failure();
                }
                responsibilities.push(itemResult.value);
            }

            return success(responsibilities);
        },
    };
}
