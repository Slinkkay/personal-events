import { ContextRoot, makeContextRoot } from "./context";
import { DomainRoot, makeDomainRoot } from "./domain";

export type CompositionRoot = {
    context: ContextRoot;
    domain: DomainRoot;
};

export function makeCompositionRoot(): CompositionRoot {
    const context = makeContextRoot();
    const domain = makeDomainRoot(context);

    return {
        context,
        domain,
    };
}

export function memoize<TArgs extends any[], TResult>(
    factory: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
    let isCached = false;
    let cachedResult: TResult;

    return function (...args: TArgs): TResult {
        if (!isCached) {
            cachedResult = factory(...args);
            isCached = true;
        }
        return cachedResult;
    };
}
