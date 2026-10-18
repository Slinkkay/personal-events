import { failure, isSuccess, Result, success, ValueResult } from "@/result";
import { AppLogger } from "@/log";

export type AssociateToResponsibilityCommand = {
    requestId: string;
    responsibilityId: string;
};

export type AssociateToResponsibility = {
    associate(command: AssociateToResponsibilityCommand): Promise<Result>;
};

export type AssociateToResponsibilityPersistenceCommand = {
    id: string;
    requestId: string;
    responsibilityId: string;
};

export type GenerateAssociateId = {
    generate(): ValueResult<string>;
};

export type AssociateToResponsibilityPersistence = {
    persist(command: AssociateToResponsibilityPersistenceCommand): Promise<Result>;
};

export function makeAssociateToResponsibility(
    appLogger: AppLogger,
    persistence: AssociateToResponsibilityPersistence,
    generate: GenerateAssociateId,
): AssociateToResponsibility {
    return {
        associate: async ({ requestId, responsibilityId }) => {
            const generateResult = generate.generate();

            if (!isSuccess(generateResult)) {
                appLogger.error({
                    type: "associateToResponsibility:generate-failed",
                });
                return failure();
            }
            const { value: id } = generateResult;

            const persistResult = await persistence.persist({
                id,
                requestId,
                responsibilityId,
            });

            if (!isSuccess(persistResult)) {
                appLogger.error({
                    type: "associateToResponsibility:persist-failed",
                });
                return failure();
            }

            return success();
        },
    };
}
