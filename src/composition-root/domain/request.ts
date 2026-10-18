import {
    AssociateToResponsibility,
    CreateRequest,
    UpdateRequestDescription,
    makeCreateRequest,
    makeAssociateToResponsibility,
    UpdateRequestDueDate,
    UpdateRequestStatus,
} from "@/domain/request";
import { memoize } from "@/composition-root";
import { ContextRoot } from "@/composition-root/context";
import { InfrastructureRoot } from "@/composition-root/infrastructure";

export type RequestRoot = {
    getCreateRequest(): CreateRequest;
    getAssociateToResponsibility(): AssociateToResponsibility;
    getUpdateRequestDescription(): UpdateRequestDescription;
    getUpdateRequestDueDate(): UpdateRequestDueDate;
    getUpdateRequestStatus(): UpdateRequestStatus;
};

export function makeRequestRoot(context: ContextRoot, infrastructure: InfrastructureRoot): RequestRoot {
    return {
        getCreateRequest: memoize(() =>
            makeCreateRequest(
                context.getAppLogger(),
                infrastructure.betterSqlite3Adapter.getCreateRequestPersistence(),
            ),
        ),
        getAssociateToResponsibility: memoize(() =>
            makeAssociateToResponsibility(
                context.getAppLogger(),
                infrastructure.betterSqlite3Adapter.getAssociateToResponsibilityPersistence(),
                infrastructure.uuid.getGenerateUUID(),
            ),
        ),
        getUpdateRequestDescription: memoize(() => infrastructure.betterSqlite3Adapter.getUpdateRequestDescription()),
        getUpdateRequestDueDate: memoize(() => infrastructure.betterSqlite3Adapter.getUpdateRequestDueDate()),
        getUpdateRequestStatus: memoize(() => infrastructure.betterSqlite3Adapter.getUpdateRequestStatus()),
    };
}
