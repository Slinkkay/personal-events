import { CompositionRoot, memoize } from "@/composition-root";
import { RegisterAndListen } from "@/app/webapp/domain/start-server";
import { makeRegisterAndListen } from "@/app/webapp/infrastructure/graphql";

export type GraphQLRootAdapter = {
    getRegisterAndListen(): RegisterAndListen;
};

export function makeGraphQLRootAdapter(): GraphQLRootAdapter {
    return {
        getRegisterAndListen: memoize(() => makeRegisterAndListen()),
    };
}
