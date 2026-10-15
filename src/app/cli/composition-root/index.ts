import { CompositionRoot, makeCompositionRoot, memoize } from "@/composition-root";
import { CliSystemInit, makeCliSystemInit } from "../system-init";
import { Result, success } from "@/result";
import { initSqliteConfig } from "@/app/common";

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

export async function initCLiRoot(root: CliCompositionRoot): Promise<Result> {
    await initSqliteConfig(root.root);

    return success();
}
