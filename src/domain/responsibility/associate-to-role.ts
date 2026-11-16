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

export type RemoveExistingAssociationCommand = {
    responsibilityId: string;
};

export type GenerateAssociateId = {
    generate(): ValueResult<string>;
};

export type AssociateToRolePersistence = {
    removeExistingAssociation(command: RemoveExistingAssociationCommand): Promise<Result>;
    persist(command: AssociateToRolePersistenceCommand): Promise<Result>;
};

export function makeAssociateToRole(
    appLogger: AppLogger,
    persistence: AssociateToRolePersistence,
    generateId: GenerateAssociateId,
): AssociateToRole {
    return {
        associate: async ({ responsibilityId, roleId }) => {
            const removeResult = await persistence.removeExistingAssociation({
                responsibilityId,
            });

            if (!isSuccess(removeResult)) {
                appLogger.error({
                    type: "associateToRole:remove-existing-association",
                });
                return failure();
            }

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
