import { CompositionRoot, makeCompositionRoot, memoize } from "@/composition-root";
import { Result, success } from "@/result";
import { initSqliteConfig } from "@/app/common";
import { makeStartServer, StartServer } from "@/app/webapp/domain/start-server";
import { makeGraphQLRequestRoot } from "@/app/webapp/composition-root/request";

export type WebServerCompositionRoot = {
    root: CompositionRoot;
    getStartServer(): StartServer;
};

export function makeWebServerCompositionRoot(): WebServerCompositionRoot {
    const root = makeCompositionRoot();

    const request = makeGraphQLRequestRoot(root);

    return {
        root,
        getStartServer: memoize(() =>
            makeStartServer(
                request.getRequestGraphQL(),
                root.domain.responsibility.getCreateResponsibility(),
                root.domain.responsibility.getGetResponsibility(),
                root.domain.responsibility.getGetResponsibilityFromRole(),
                root.domain.role.getCreateRole(),
                root.domain.role.getGetRole(),
                root.domain.role.getGetAllRoles(),
                root.domain.responsibility.getAssociateToRole(),
            ),
        ),
    };
}

export async function initWebServerCompositionRoot(root: WebServerCompositionRoot): Promise<Result> {
    await initSqliteConfig(root.root);

    return success();
}
