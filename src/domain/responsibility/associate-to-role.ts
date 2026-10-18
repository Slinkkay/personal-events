import { failure, isSuccess, Result, success, ValueResult } from "@/result";
import { AppLogger } from "@/log";

export type AssociateToRoleCommand = {
    roleId: string;
    responsibilityId: string;
};

export type AssociateToRole = {
    associate(command: AssociateToRoleCommand): Promise<Result>;
};

export type AssociateToRolePersistenceCommand = {
    roleId: string;
    responsibilityId: string;
    id: string;
};

export type GenerateAssociateId = {
    generate(): ValueResult<string>;
};

export type AssociateToRolePersistence = {
    persist(command: AssociateToRolePersistenceCommand): Promise<Result>;
};

export function makeAssociateToRole(
    appLogger: AppLogger,
    persistence: AssociateToRolePersistence,
    generateId: GenerateAssociateId,
): AssociateToRole {
    return {
        associate: async ({ responsibilityId, roleId }) => {
            const idResult = generateId.generate();

            if (!isSuccess(idResult)) {
                appLogger.error({
                    type: "associateToRole:id-generate-failed",
                });
                return failure();
            }

            const persistResult = await persistence.persist({
                id: idResult.value,
                responsibilityId,
                roleId,
            });

            if (!isSuccess(persistResult)) {
                appLogger.error({
                    type: "associateToRole:persist-failed",
                });
                return failure();
            }

            return success();
        },
    };
}
