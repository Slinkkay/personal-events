import { CompositionRoot, makeCompositionRoot, memoize } from "@/composition-root";
import { CliSystemInit, makeCliSystemInit } from "../system-init";

export type CliCompositionRoot = {
    root: CompositionRoot;
    getSystemInit(): CliSystemInit;
};

export function makeCliCompositionRoot(): CliCompositionRoot {
    const root = makeCompositionRoot();

    return {
        root,
        getSystemInit: memoize(() => makeCliSystemInit(root.domain.init.getSystemInit())),
    };
}
