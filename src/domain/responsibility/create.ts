import { failure, isSuccess, Result, success, ValueResult } from "@/result";
import { AppLogger } from "@/log";

export type CreateResponsibilityCommand = {
    name: string;
    description: string;
};

export type CreateResponsibility = {
    create(command: CreateResponsibilityCommand): Promise<Result>;
};

export type CreateResponsibilityPersistenceCommand = {
    id: string;
    name: string;
    description: string;
    status: string;
};

export type CreateResponsibilityPersistence = {
    getNextResponsibilityId(): Promise<ValueResult<string>>;
    persist(command: CreateResponsibilityPersistenceCommand): Promise<Result>;
};

export function makeCreateResponsibility(
    appLogger: AppLogger,
    persistence: CreateResponsibilityPersistence,
): CreateResponsibility {
    return {
        create: async ({ description, name }) => {
            const nextIdResult = await persistence.getNextResponsibilityId();

            if (!isSuccess(nextIdResult)) {
                appLogger.error({
                    type: "failed-to-get-next-responsibility",
                });
                return failure();
            }
            const { value: id } = nextIdResult;

            const result = await persistence.persist({
                id,
                description,
                name,
                status: "OPEN",
            });

            if (!isSuccess(result)) {
                appLogger.error({
                    type: "failed-to-get-create-responsibility",
                });
                return failure();
            }
            return success();
        },
    };
}
