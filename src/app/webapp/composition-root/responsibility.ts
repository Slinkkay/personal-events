import {
    makeResponsibilityGraphQL,
    makeResponsibilityMutation,
    makeResponsibilityQuery,
    ResponsibilityGraphQL,
} from "@/app/webapp/domain/responsibility";
import { CompositionRoot, memoize } from "@/composition-root";

export type GraphQLResponsibilityRoot = {
    getResponsibilityGraphQL(): ResponsibilityGraphQL;
};

export function makeGraphQLResponsibilityRoot(root: CompositionRoot): GraphQLResponsibilityRoot {
    const getResponsibilityQuery = memoize(() =>
        makeResponsibilityQuery(root.domain.responsibility.getGetResponsibility()),
    );

    const getResponsibilityMutation = memoize(() =>
        makeResponsibilityMutation(
            root.domain.responsibility.getCreateResponsibility(),
            root.domain.responsibility.getAssociateToRole(),
            root.domain.responsibility.getUpdateResponsibilityName(),
            root.domain.responsibility.getUpdateResponsibilityDescription(),
            root.domain.responsibility.getUpdateResponsibilityStatus(),
        ),
    );

    return {
        getResponsibilityGraphQL: memoize(() =>
            makeResponsibilityGraphQL(
                getResponsibilityQuery(),
                getResponsibilityMutation(),
                root.domain.responsibility.getGetResponsibilityFromRole(),
            ),
        ),
    };
}
