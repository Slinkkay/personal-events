import { makeSystemInit, SystemInit } from "@/domain/init";
import { memoize } from "@/composition-root";
import { ContextRoot } from "@/composition-root/context";
import { InfrastructureRoot } from "@/composition-root/infrastructure";

export type InitRoot = {
    getSystemInit(): SystemInit;
};

export function makeInitRoot(context: ContextRoot, infrastructure: InfrastructureRoot): InitRoot {
    return {
        getSystemInit: memoize(() =>
            makeSystemInit(infrastructure.betterSqlite3Adapter.getPersistenceInit(), context.getAppLogger()),
        ),
    };
}
