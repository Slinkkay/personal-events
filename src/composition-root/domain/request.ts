import { CreateRequest, makeCreateRequest } from "@/domain/request";
import { memoize } from "@/composition-root";
import { ContextRoot } from "@/composition-root/context";
import { InfrastructureRoot } from "@/composition-root/infrastructure";

export type RequestRoot = {
    getCreateRequest(): CreateRequest;
};

export function makeRequestRoot(context: ContextRoot, infrastructure: InfrastructureRoot): RequestRoot {
    return {
        getCreateRequest: memoize(() =>
            makeCreateRequest(
                context.getAppLogger(),
                infrastructure.betterSqlite3Adapter.getCreateRequestPersistence(),
            ),
        ),
    };
}
