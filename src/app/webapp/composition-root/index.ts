import { CompositionRoot, makeCompositionRoot, memoize } from "@/composition-root";
import { Result, success } from "@/result";
import { initSqliteConfig } from "@/app/common";
import { GraphQLRootAdapter, makeGraphQLRootAdapter } from "./infrastructure";
import { makeStartServer, StartServer } from "@/app/webapp/domain/start-server";

export type WebServerCompositionRoot = {
    root: CompositionRoot;
    graphQLAdapter: GraphQLRootAdapter;
    getStartServer(): StartServer;
};

export function makeWebServerCompositionRoot(): WebServerCompositionRoot {
    const root = makeCompositionRoot();

    const graphQLAdapter = makeGraphQLRootAdapter();

    return {
        root,
        graphQLAdapter,
        getStartServer: memoize(() =>
            makeStartServer(
                graphQLAdapter.getRegisterAndListen(),
                root.domain.request.getCreateRequest(),
                root.domain.request.getGetRequest(),
            ),
        ),
    };
}

export async function initWebServerCompositionRoot(root: WebServerCompositionRoot): Promise<Result> {
    await initSqliteConfig(root.root);

    return success();
}
