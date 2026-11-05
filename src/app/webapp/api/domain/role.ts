import { isSuccess } from "@/result";
import {
    CreateRole,
    GetAllRoles,
    GetRole,
    UpdateRoleDescription,
    UpdateRoleName,
    UpdateRoleStatus,
} from "@/domain/role";

export type RoleMutation = {
    roleCreate: (_: unknown, command: any) => Promise<any>;
    roleUpdateDescription: (_: unknown, command: any) => Promise<any>;
    roleUpdateName: (_: unknown, command: any) => Promise<any>;
    roleUpdateStatus: (_: unknown, command: any) => Promise<any>;
};

export function makeRoleMutation(
    createRole: CreateRole,
    updateRoleDescription: UpdateRoleDescription,
    updateRoleName: UpdateRoleName,
    updateRoleStatus: UpdateRoleStatus,
): RoleMutation {
    return {
        roleCreate: async (_: unknown, { description, name }: any) => {
            const result = await createRole.create({
                description,
                name,
            });

            if (!isSuccess(result)) {
                throw new Error("Failed to create role");
            }
            return { id: result.value };
        },
        roleUpdateDescription: async (_, command) => {
            const result = await updateRoleDescription.update({
                id: command.roleId,
                description: command.description,
            });

            if (!isSuccess(result)) {
                throw new Error("Failed to update role description");
            }
            return true;
        },
        roleUpdateName: async (_, command) => {
            const result = await updateRoleName.update({
                id: command.roleId,
                name: command.name,
            });

            if (!isSuccess(result)) {
                throw new Error("Failed to update role name");
            }
            return true;
        },
        roleUpdateStatus: async (_, command) => {
            const result = await updateRoleStatus.update({
                id: command.roleId,
                status: command.status,
            });

            if (!isSuccess(result)) {
                throw new Error("Failed to update role status");
            }
            return true;
        },
    };
}

export type RoleQuery = {
    role: (_: unknown, command: any) => Promise<any>;
    roles: (_: unknown, command: any) => Promise<any>;
};

export function makeRoleQuery(getRole: GetRole, getAllRoles: GetAllRoles): RoleQuery {
    return {
        role: async (_: unknown, command: any) => {
            const result = await getRole.get(command);
            if (!isSuccess(result)) {
                throw new Error("Failed to get role");
            }
            return result.value;
        },
        roles: async () => {
            const result = await getAllRoles.getAll();
            if (!isSuccess(result)) {
                throw new Error("Failed to get all roles");
            }
            return result.value;
        },
    };
}

export type RoleGraphQL = {
    Query: RoleQuery;
    Mutation: RoleMutation;
};

export function makeRoleGraphQL(Query: RoleQuery, Mutation: RoleMutation): RoleGraphQL {
    return {
        Query,
        Mutation,
    };
}
