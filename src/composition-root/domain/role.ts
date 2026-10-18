import { CreateRole, makeCreateRole, UpdateRoleDescription } from "@/domain/role";
import { memoize } from "@/composition-root";
import { ContextRoot } from "@/composition-root/context";
import { InfrastructureRoot } from "@/composition-root/infrastructure";

export type RoleRoot = {
    getCreateRole(): CreateRole;
    getUpdateRoleDescription(): UpdateRoleDescription;
};

export function makeRoleRoot(context: ContextRoot, infrastructure: InfrastructureRoot): RoleRoot {
    const sqliteAdapter = infrastructure.betterSqlite3Adapter;

    return {
        getCreateRole: memoize(() => makeCreateRole(context.getAppLogger(), sqliteAdapter.getCreateRolePersistence())),
        getUpdateRoleDescription: memoize(() => infrastructure.betterSqlite3Adapter.getUpdateRoleDescription()),
    };
}
