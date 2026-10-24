import { CompositionRoot, makeCompositionRoot, memoize } from "@/composition-root";
import { Result, success } from "@/result";
import { initSqliteConfig } from "@/app/common";
import { makeStartServer, StartServer } from "@/app/webapp/domain/start-server";

export type WebServerCompositionRoot = {
    root: CompositionRoot;
    getStartServer(): StartServer;
};

export function makeWebServerCompositionRoot(): WebServerCompositionRoot {
    const root = makeCompositionRoot();

    return {
        root,
        getStartServer: memoize(() =>
            makeStartServer(
                root.domain.request.getCreateRequest(),
                root.domain.request.getGetRequest(),
                root.domain.role.getCreateRole(),
                root.domain.role.getGetRole(),
            ),
        ),
    };
}

export async function initWebServerCompositionRoot(root: WebServerCompositionRoot): Promise<Result> {
    await initSqliteConfig(root.root);

    return success();
}
