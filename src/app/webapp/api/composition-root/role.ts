import { CompositionRoot, memoize } from "@/composition-root";
import { makeRoleGraphQL, makeRoleMutation, makeRoleQuery, RoleGraphQL } from "@/app/webapp/api/domain/role";

export type GraphQLRoleRoot = {
    getGraphQLRole(): RoleGraphQL;
};

export function makeGraphQLRoleRoot(root: CompositionRoot): GraphQLRoleRoot {
    const getQuery = memoize(() => makeRoleQuery(root.domain.role.getGetRole(), root.domain.role.getGetAllRoles()));

    const getMutation = memoize(() =>
        makeRoleMutation(
            root.domain.role.getCreateRole(),
            root.domain.role.getUpdateRoleDescription(),
            root.domain.role.getUpdateRoleName(),
        ),
    );

    return {
        getGraphQLRole: memoize(() => makeRoleGraphQL(getQuery(), getMutation())),
    };
}
