import { StartWebGraphQL, makeStartWebGraphQL } from "./start-web-graphql";
import { CompositionRoot, memoize } from "@/composition-root";

export type GraphQLRoot = {
    getStartWebGraphQL(): StartWebGraphQL;
};

export function makeGraphQLRoot(compositionRoot: CompositionRoot): GraphQLRoot {
    return {
        getStartWebGraphQL: memoize(() => makeStartWebGraphQL(compositionRoot)),
    };
}
