import { InitRoot, makeInitRoot } from "./init";
import { ContextRoot } from "@/composition-root/context";
import { InfrastructureRoot } from "@/composition-root/infrastructure";

export type DomainRoot = {
    init: InitRoot;
};

export function makeDomainRoot(context: ContextRoot, infrastructure: InfrastructureRoot): DomainRoot {
    const init = makeInitRoot(context, infrastructure);

    return {
        init,
    };
}
