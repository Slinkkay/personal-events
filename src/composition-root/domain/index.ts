import { InitRoot, makeInitRoot } from "./init";
import { ContextRoot } from "@/composition-root/context";

export type DomainRoot = {
    init: InitRoot;
};

export function makeDomainRoot(context: ContextRoot): DomainRoot {
    const init = makeInitRoot(context);

    return {
        init,
    };
}
