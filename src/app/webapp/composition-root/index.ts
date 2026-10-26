import { CompositionRoot, makeCompositionRoot, memoize } from "@/composition-root";
import { Result, success } from "@/result";
import { initSqliteConfig } from "@/app/common";
import { makeStartServer, StartServer } from "@/app/webapp/domain/start-server";
import { makeGraphQLRequestRoot } from "./request";
import { makeGraphQLResponsibilityRoot } from "./responsibility";
import { makeGraphQLRoleRoot } from "@/app/webapp/composition-root/role";

export type WebServerCompositionRoot = {
    root: CompositionRoot;
    getStartServer(): StartServer;
};

export function makeWebServerCompositionRoot(): WebServerCompositionRoot {
    const root = makeCompositionRoot();

    const request = makeGraphQLRequestRoot(root);

    const responsibility = makeGraphQLResponsibilityRoot(root);

    const role = makeGraphQLRoleRoot(root);

    return {
        root,
        getStartServer: memoize(() =>
            makeStartServer(
                request.getRequestGraphQL(),
                responsibility.getResponsibilityGraphQL(),
                role.getGraphQLRole(),
            ),
        ),
    };
}

export async function initWebServerCompositionRoot(root: WebServerCompositionRoot): Promise<Result> {
    await initSqliteConfig(root.root);

    return success();
}
