import {
    CreateRole,
    GetAllRoles,
    GetRole,
    makeCreateRole,
    UpdateRoleDescription,
    UpdateRoleName,
    UpdateRoleStatus,
} from "@/domain/role";
import { memoize } from "@/composition-root";
import { ContextRoot } from "@/composition-root/context";
import { InfrastructureRoot } from "@/composition-root/infrastructure";

export type RoleRoot = {
    getCreateRole(): CreateRole;
    getUpdateRoleDescription(): UpdateRoleDescription;
    getUpdateRoleName(): UpdateRoleName;
    getUpdateRoleStatus(): UpdateRoleStatus;
    getGetRole(): GetRole;
    getGetAllRoles(): GetAllRoles;
};

export function makeRoleRoot(context: ContextRoot, infrastructure: InfrastructureRoot): RoleRoot {
    const role = infrastructure.betterSqlite3Adapter.role;

    return {
        getCreateRole: memoize(() => makeCreateRole(context.getAppLogger(), role.getCreateRolePersistence())),
        getUpdateRoleDescription: memoize(() => role.getUpdateRoleDescription()),
        getUpdateRoleName: memoize(() => role.getUpdateRoleName()),
        getUpdateRoleStatus: memoize(() => role.getUpdateRoleStatus()),
        getGetRole: memoize(() => role.getRole()),
        getGetAllRoles: memoize(() => role.getGetAllRoles()),
    };
}
