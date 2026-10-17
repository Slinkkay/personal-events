import { InitRoot, makeInitRoot } from "./init";
import { RoleRoot, makeRoleRoot } from "./role";
import { ResponsibilityRoot, makeResponsibilityRoot } from "./responsibility";
import { RequestRoot, makeRequestRoot } from "./request";
import { ContextRoot } from "@/composition-root/context";
import { InfrastructureRoot } from "@/composition-root/infrastructure";

export type DomainRoot = {
    init: InitRoot;
    role: RoleRoot;
    responsibility: ResponsibilityRoot;
    request: RequestRoot;
};

export function makeDomainRoot(context: ContextRoot, infrastructure: InfrastructureRoot): DomainRoot {
    const init = makeInitRoot(context, infrastructure);
    const role = makeRoleRoot(context, infrastructure);
    const responsibility = makeResponsibilityRoot(context, infrastructure);
    const request = makeRequestRoot(context, infrastructure);

    return {
        init,
        role,
        responsibility,
        request,
    };
}
