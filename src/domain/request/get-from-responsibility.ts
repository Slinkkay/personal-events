import { GetRequest, Request } from "@/domain/request";
import { failure, isSuccess, success, ValueResult } from "@/result";

export type GetFromResponsibilityCommand = {
    responsibilityId: string;
};

export type GetFromResponsibility = {
    get(command: GetFromResponsibilityCommand): Promise<ValueResult<Request[]>>;
};

export type GetFromResponsibilityPersistence = {
    get(command: { responsibilityId: string }): Promise<ValueResult<string[]>>;
};

export function makeGetFromResponsibility(
    persistence: GetFromResponsibilityPersistence,
    getRequest: GetRequest,
): GetFromResponsibility {
    return {
        get: async ({ responsibilityId }) => {
            const result = await persistence.get({ responsibilityId });

            if (!isSuccess(result)) {
                return failure();
            }

            const requests: Request[] = [];

            for await (let id of result.value) {
                const requestResult = await getRequest.get({
                    id,
                });

                if (!isSuccess(requestResult)) {
                    return failure();
                }
                requests.push(requestResult.value);
            }

            return success(requests);
        },
    };
}
