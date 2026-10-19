import {
    AssociateToRole,
    CreateResponsibility,
    makeAssociateToRole,
    makeCreateResponsibility,
    UpdateResponsibilityDescription,
    UpdateResponsibilityName,
    UpdateResponsibilityStatus,
} from "@/domain/responsibility";
import { InfrastructureRoot } from "@/composition-root/infrastructure";
import { ContextRoot } from "@/composition-root/context";
import { memoize } from "@/composition-root";

export type ResponsibilityRoot = {
    getCreateResponsibility(): CreateResponsibility;
    getAssociateToRole(): AssociateToRole;
    getUpdateResponsibilityName(): UpdateResponsibilityName;
    getUpdateResponsibilityDescription(): UpdateResponsibilityDescription;
    getUpdateResponsibilityStatus(): UpdateResponsibilityStatus;
};

export function makeResponsibilityRoot(context: ContextRoot, infrastructure: InfrastructureRoot): ResponsibilityRoot {
    return {
        getCreateResponsibility: () => {
            return makeCreateResponsibility(
                context.getAppLogger(),
                infrastructure.betterSqlite3Adapter.getCreateResponsibilityPersistence(),
            );
        },
        getAssociateToRole: memoize(() =>
            makeAssociateToRole(
                context.getAppLogger(),
                infrastructure.betterSqlite3Adapter.role.getAssociateToRolePersistence(),
                infrastructure.uuid.getGenerateUUID(),
            ),
        ),
        getUpdateResponsibilityName: memoize(() => infrastructure.betterSqlite3Adapter.getUpdateResponsibilityName()),
        getUpdateResponsibilityDescription: memoize(() =>
            infrastructure.betterSqlite3Adapter.getUpdateResponsibilityDescription(),
        ),
        getUpdateResponsibilityStatus: memoize(() =>
            infrastructure.betterSqlite3Adapter.getUpdateResponsibilityStatus(),
        ),
    };
}
