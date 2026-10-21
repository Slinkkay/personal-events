import {
    AssociateToRole,
    CreateResponsibility,
    GetResponsibility,
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
    getGetResponsibility(): GetResponsibility;
};

export function makeResponsibilityRoot(context: ContextRoot, infrastructure: InfrastructureRoot): ResponsibilityRoot {
    const responsibility = infrastructure.betterSqlite3Adapter.responsibility;

    return {
        getCreateResponsibility: () => {
            return makeCreateResponsibility(
                context.getAppLogger(),
                responsibility.getCreateResponsibilityPersistence(),
            );
        },
        getAssociateToRole: memoize(() =>
            makeAssociateToRole(
                context.getAppLogger(),
                responsibility.getAssociateToRolePersistence(),
                infrastructure.uuid.getGenerateUUID(),
            ),
        ),
        getUpdateResponsibilityName: memoize(() => responsibility.getUpdateResponsibilityName()),
        getUpdateResponsibilityDescription: memoize(() => responsibility.getUpdateResponsibilityDescription()),
        getUpdateResponsibilityStatus: memoize(() => responsibility.getUpdateResponsibilityStatus()),
        getGetResponsibility: memoize(() => responsibility.getResponsibility()),
    };
}
