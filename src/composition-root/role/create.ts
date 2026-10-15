import { failure, isSuccess, Result, success, ValueResult } from "@/result";
import { AppLogger } from "@/log";

export type CreateRoleCommand = {
    name: string;
    description: string;
};

export type CreateRole = {
    /**
     * Creates the role outlined by the details.
     * @param command
     * @return The Role ID associated to the role
     */
    create(command: CreateRoleCommand): Promise<ValueResult<string>>;
};

export type CreateRolePersistence = {
    getNextRoleId(): Promise<ValueResult<string>>;
    createRole(command: { roleId: string; name: string; description: string }): Promise<Result>;
};

export function makeCreateRole(appLogger: AppLogger, persistence: CreateRolePersistence): CreateRole {
    return {
        create: async ({ description, name }) => {
            const nextIdResult = await persistence.getNextRoleId();

            if (!isSuccess(nextIdResult)) {
                appLogger.error({
                    type: "failed-to-get-next-id",
                });
                return failure();
            }

            const { value: roleId } = nextIdResult;

            const createResult = await persistence.createRole({
                description,
                name,
                roleId,
            });

            if (!isSuccess(createResult)) {
                appLogger.error({
                    type: "failed-to-create-role",
                });
                return failure();
            }

            return success(roleId);
        },
    };
}
