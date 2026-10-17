import { CreateResponsibility, makeCreateResponsibility } from "@/domain/responsibility";
import { InfrastructureRoot } from "@/composition-root/infrastructure";
import { ContextRoot } from "@/composition-root/context";

export type ResponsibilityRoot = {
    getCreateResponsibility(): CreateResponsibility;
};

export function makeResponsibilityRoot(context: ContextRoot, infrastructure: InfrastructureRoot): ResponsibilityRoot {
    return {
        getCreateResponsibility: () => {
            return makeCreateResponsibility(
                context.getAppLogger(),
                infrastructure.betterSqlite3Adapter.getCreateResponsibilityPersistence(),
            );
        },
    };
}
