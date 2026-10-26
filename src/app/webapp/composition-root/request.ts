import { makeRequestGraphQL, makeRequestMutation, makeRequestQuery, RequestGraphQL } from "@/app/webapp/domain/request";
import { CompositionRoot, memoize } from "@/composition-root";

export type GraphQLRequestRoot = {
    getRequestGraphQL(): RequestGraphQL;
};

export function makeGraphQLRequestRoot(root: CompositionRoot): GraphQLRequestRoot {
    const getRequestMutation = memoize(() =>
        makeRequestMutation(
            root.domain.request.getCreateRequest(),
            root.domain.request.getAssociateToResponsibility(),
            root.domain.request.getUpdateRequestDescription(),
        ),
    );

    const getRequestQuery = memoize(() =>
        makeRequestQuery(root.domain.request.getGetRequest(), root.domain.request.getGetAllRequests()),
    );

    return {
        getRequestGraphQL: memoize(() =>
            makeRequestGraphQL(getRequestQuery(), getRequestMutation(), root.domain.request.getFromResponsibility()),
        ),
    };
}
