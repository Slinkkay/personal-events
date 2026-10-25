import {
    AssociateToResponsibility,
    CreateRequest,
    GetAllRequests,
    UpdateRequestDescription,
    makeCreateRequest,
    makeAssociateToResponsibility,
    UpdateRequestDueDate,
    UpdateRequestStatus,
    GetRequest,
} from "@/domain/request";
import { memoize } from "@/composition-root";
import { ContextRoot } from "@/composition-root/context";
import { InfrastructureRoot } from "@/composition-root/infrastructure";
import { GetFromResponsibility, makeGetFromResponsibility } from "@/domain/request/get-from-responsibility";

export type RequestRoot = {
    getCreateRequest(): CreateRequest;
    getAssociateToResponsibility(): AssociateToResponsibility;
    getUpdateRequestDescription(): UpdateRequestDescription;
    getUpdateRequestDueDate(): UpdateRequestDueDate;
    getUpdateRequestStatus(): UpdateRequestStatus;
    getGetRequest(): GetRequest;
    getGetAllRequests(): GetAllRequests;
    getFromResponsibility(): GetFromResponsibility;
};

export function makeRequestRoot(context: ContextRoot, infrastructure: InfrastructureRoot): RequestRoot {
    const request = infrastructure.betterSqlite3Adapter.request;

    const getGetRequest = memoize(() => request.getRequest());

    return {
        getCreateRequest: memoize(() =>
            makeCreateRequest(context.getAppLogger(), request.getCreateRequestPersistence()),
        ),
        getAssociateToResponsibility: memoize(() =>
            makeAssociateToResponsibility(
                context.getAppLogger(),
                request.getAssociateToResponsibilityPersistence(),
                infrastructure.uuid.getGenerateUUID(),
            ),
        ),
        getUpdateRequestDescription: memoize(() => request.getUpdateRequestDescription()),
        getUpdateRequestDueDate: memoize(() => request.getUpdateRequestDueDate()),
        getUpdateRequestStatus: memoize(() => request.getUpdateRequestStatus()),
        getGetRequest,
        getGetAllRequests: memoize(() => request.getGetAllRequests()),
        getFromResponsibility: memoize(() =>
            makeGetFromResponsibility(request.getGetFromResponsibilityPersistence(), getGetRequest()),
        ),
    };
}
