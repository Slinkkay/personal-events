import { isSuccess } from "@/result";
import {
    AssociateToResponsibility,
    CreateRequest,
    GetAllRequests,
    GetFromResponsibility,
    GetRequest,
    UpdateRequestDescription,
} from "@/domain/request";

export type RequestMutation = {
    requestCreate: (_: unknown, command: any) => any;
    requestUpdateDescription: (_: unknown, command: any) => any;
    requestAssociateToResponsibility: (_: unknown, command: any) => any;
};

export function makeRequestMutation(
    createRequest: CreateRequest,
    associateToResponsibility: AssociateToResponsibility,
    updateRequestDescription: UpdateRequestDescription,
): RequestMutation {
    return {
        requestCreate: async (_: unknown, command: any) => {
            const result = await createRequest.create({
                dueDate: command.dueDate,
                description: command.description,
            });

            if (!isSuccess(result)) {
                throw new Error("Failed to create request");
            }

            return { id: result.value };
        },
        requestAssociateToResponsibility: async (_: unknown, command: any) => {
            const result = await associateToResponsibility.associate({
                responsibilityId: command.responsibilityId,
                requestId: command.requestId,
            });

            if (!isSuccess(result)) {
                throw new Error("Failed to associate to responsibility");
            }

            return true;
        },
        requestUpdateDescription: async (_: unknown, command: any) => {
            const result = await updateRequestDescription.update({
                description: command.description,
                id: command.requestId,
            });

            if (!isSuccess(result)) {
                throw new Error("Failed to associate to request description");
            }

            return true;
        },
    };
}

export type RequestQuery = {
    request: (_: unknown, command: any) => any;
    requests: (_: unknown, command: any) => any;
};

export function makeRequestQuery(getRequest: GetRequest, getAllRequests: GetAllRequests): RequestQuery {
    return {
        requests: async () => {
            const result = await getAllRequests.getAll();
            if (!isSuccess(result)) {
                throw new Error("Failed to get all requests");
            }
            return result.value;
        },
        request: async (_: unknown, { id }: { id: string }) => {
            const result = await getRequest.get({ id });
            if (!isSuccess(result)) {
                throw new Error("Failed to get request");
            }
            return result.value;
        },
    };
}

export type RequestGraphQL = {
    Query: RequestQuery;
    Mutation: RequestMutation;
    Responsibility: {
        requests: (parent: { id: string }) => any;
    };
};

export function makeRequestGraphQL(
    Query: RequestQuery,
    Mutation: RequestMutation,
    getFromResponsibility: GetFromResponsibility,
): RequestGraphQL {
    return {
        Mutation,
        Query,
        Responsibility: {
            requests: async ({ id }) => {
                const result = await getFromResponsibility.get({
                    responsibilityId: id,
                });

                if (!isSuccess(result)) {
                    throw new Error("Failed to get requests from responsibility");
                }
                return result.value;
            },
        },
    };
}
