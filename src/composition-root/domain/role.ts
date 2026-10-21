import { CreateRole, GetRole, makeCreateRole, UpdateRoleDescription, UpdateRoleName } from "@/domain/role";
import { memoize } from "@/composition-root";
import { ContextRoot } from "@/composition-root/context";
import { InfrastructureRoot } from "@/composition-root/infrastructure";

export type RoleRoot = {
    getCreateRole(): CreateRole;
    getUpdateRoleDescription(): UpdateRoleDescription;
    getUpdateRoleName(): UpdateRoleName;
    getGetRole(): GetRole;
};

export function makeRoleRoot(context: ContextRoot, infrastructure: InfrastructureRoot): RoleRoot {
    const role = infrastructure.betterSqlite3Adapter.role;

    return {
        getCreateRole: memoize(() => makeCreateRole(context.getAppLogger(), role.getCreateRolePersistence())),
        getUpdateRoleDescription: memoize(() => role.getUpdateRoleDescription()),
        getUpdateRoleName: memoize(() => role.getUpdateRoleName()),
        getGetRole: memoize(() => role.getRole()),
    };
}
