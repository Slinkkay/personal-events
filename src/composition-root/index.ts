import { ContextRoot, makeContextRoot } from "./context";
import { DomainRoot, makeDomainRoot } from "./domain";
import { Result, success } from "@/result";
import { makeInfrastructureRoot } from "./infrastructure";
import { AppLogger } from "@/log";

export type RootInit = {
    init(options: any): Promise<Result>;
};

export type CompositionRoot = {
    context: ContextRoot;
    infrastructure: RootInit;
    domain: DomainRoot;
} & RootInit;

export function makeCompositionRoot(): CompositionRoot {
    const context = makeContextRoot();
    const infrastructure = makeInfrastructureRoot(context);
    const domain = makeDomainRoot(context, infrastructure);

    const initArray: RootInit[] = [infrastructure];

    const init = async (config: any) => {
        /* If context ever takes an init property that there needs to be a Logger backup
         * as the current logger is tied to the context root
         **/
        let logger: AppLogger | undefined;
        try {
            logger = context.getAppLogger();
            for await (const item of initArray) {
                const result = await item.init(config);
            }
        } catch (err: any) {
            if (logger === undefined) {
                process.exit(100);
            }
            logger.error({
                type: "init-failed",
                err,
            });
        }
        return success();
    };

    return {
        context,
        domain,
        infrastructure,
        init,
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
