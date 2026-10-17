import { failure, isSuccess, Result, success, ValueResult } from "@/result";
import { AppLogger } from "@/log";

export type CreateRequestCommand = {
    description: string;
    dueDate: string;
};

export type CreateRequest = {
    create(command: CreateRequestCommand): Promise<ValueResult<string>>;
};

export type CreateRequestPersistenceCommand = {
    id: string;
    description: string;
    dueDate: string;
    status: string;
};

export type CreateRequestPersistence = {
    create(command: CreateRequestPersistenceCommand): Promise<Result>;
    getNextId(): Promise<ValueResult<string>>;
};

export function makeCreateRequest(appLogger: AppLogger, persistence: CreateRequestPersistence): CreateRequest {
    return {
        create: async ({ description, dueDate }) => {
            const nextIdResult = await persistence.getNextId();

            if (!isSuccess(nextIdResult)) {
                appLogger.error({
                    type: "request:failed-next-id-lookup",
                });
                return failure();
            }

            const createResult = await persistence.create({
                id: nextIdResult.value,
                description,
                dueDate,
                status: "OPEN",
            });

            if (!isSuccess(createResult)) {
                appLogger.error({
                    type: "request:failed-create",
                });
                return failure();
            }

            return success(nextIdResult.value);
        },
    };
}
