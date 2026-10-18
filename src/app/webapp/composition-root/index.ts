import { CompositionRoot, makeCompositionRoot, memoize } from "@/composition-root";
import { Result, success } from "@/result";
import { initSqliteConfig } from "@/app/common";
import { makeWebAppInfrastructure, WebAppInfrastructure } from "@/app/webapp/infrastructure";

export type WebServerCompositionRoot = {
    root: CompositionRoot;
    infrastructure: WebAppInfrastructure;
};

export function makeWebServerCompositionRoot(): WebServerCompositionRoot {
    const root = makeCompositionRoot();

    const infrastructure = makeWebAppInfrastructure(root);

    return {
        root,
        infrastructure,
    };
}

export async function initWebServerCompositionRoot(root: WebServerCompositionRoot): Promise<Result> {
    await initSqliteConfig(root.root);

    return success();
}
