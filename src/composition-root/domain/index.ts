import { InitRoot, makeInitRoot } from "./init";
import { RoleRoot, makeRoleRoot } from "./role";
import { ResponsibilityRoot, makeResponsibilityRoot } from "./responsibility";
import { ContextRoot } from "@/composition-root/context";
import { InfrastructureRoot } from "@/composition-root/infrastructure";

export type DomainRoot = {
    init: InitRoot;
    role: RoleRoot;
    responsibility: ResponsibilityRoot;
};

export function makeDomainRoot(context: ContextRoot, infrastructure: InfrastructureRoot): DomainRoot {
    const init = makeInitRoot(context, infrastructure);
    const role = makeRoleRoot(context, infrastructure);
    const responsibility = makeResponsibilityRoot(context, infrastructure);

    return {
        init,
        role,
        responsibility,
    };
}
