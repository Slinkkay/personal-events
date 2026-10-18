import { GraphQLRoot, makeGraphQLRoot } from "./graphql";
import { CompositionRoot } from "@/composition-root";

export type WebAppInfrastructure = {
    graphQL: GraphQLRoot;
};

export function makeWebAppInfrastructure(compositionRoot: CompositionRoot): WebAppInfrastructure {
    return {
        graphQL: makeGraphQLRoot(compositionRoot),
    };
}
