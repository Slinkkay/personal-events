import {
    AssociateToRole,
    CreateResponsibility,
    makeAssociateToRole,
    makeCreateResponsibility,
    UpdateResponsibilityDescription,
    UpdateResponsibilityName,
} from "@/domain/responsibility";
import { InfrastructureRoot } from "@/composition-root/infrastructure";
import { ContextRoot } from "@/composition-root/context";
import { memoize } from "@/composition-root";

export type ResponsibilityRoot = {
    getCreateResponsibility(): CreateResponsibility;
    getAssociateToRole(): AssociateToRole;
    getUpdateResponsibilityName(): UpdateResponsibilityName;
    getUpdateResponsibilityDescription(): UpdateResponsibilityDescription;
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
                infrastructure.betterSqlite3Adapter.getAssociateToRolePersistence(),
                infrastructure.uuid.getGenerateUUID(),
            ),
        ),
        getUpdateResponsibilityName: memoize(() => infrastructure.betterSqlite3Adapter.getUpdateResponsibilityName()),
        getUpdateResponsibilityDescription: memoize(() =>
            infrastructure.betterSqlite3Adapter.getUpdateResponsibilityDescription(),
        ),
    };
}
